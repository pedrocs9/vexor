/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { generateReceipt } from "./sale-receipt";
import CartPanel from "./pos/cart-panel";
import PaymentDialog from "./pos/payment-dialog";
import ProductCatalog from "./pos/product-catalog";
import SalesHistoryDialog from "./pos/sales-history-dialog";
import { useBarcodeScanner } from "./pos/use-barcode-scanner";
import { usePosKeyboard } from "./pos/use-pos-keyboard";
import { notify } from "./toast";
import ConfirmDialog from "./ui/confirm-dialog";
import type { CartItem, CompletedSaleSummary, NewCustomerDraft, PaymentMethod, PaymentOption, PosCustomer, SaleHistoryItem } from "./pos/types";

const PAYMENT_METHODS: PaymentOption[] = [
  { value: "cash", label: "Efectivo", icon: "💵" },
  { value: "debit", label: "Débito", icon: "💳" },
  { value: "credit", label: "Crédito", icon: "💳" },
  { value: "transfer", label: "Transferencia", icon: "🏦" },
  { value: "fiado", label: "Fiado", icon: "📋" },
];

// Componente principal
export default function PosClient({
  products,
  categories,
  customers,
  tenantId,
  userId,
}: {
  products: any[];
  categories: any[];
  customers: any[];
  tenantId: number;
  userId: number;
}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discountInput, setDiscountInput] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomerDraft>({
    name: "",
    phone: "",
    rut: "",
  });
  const [newCustomerLoading, setNewCustomerLoading] = useState(false);
  const [newCustomerError, setNewCustomerError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentSubmitError, setPaymentSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSaleSummary | null>(null);
  const [showClearSaleConfirm, setShowClearSaleConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [todaySales, setTodaySales] = useState<SaleHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteSale, setDeleteSale] = useState<SaleHistoryItem | null>(null);
  const [deleteSaleLoading, setDeleteSaleLoading] = useState(false);
  const [generatingPdfSaleId, setGeneratingPdfSaleId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const parsedDiscount = discountInput.trim() === "" ? 0 : Number(discountInput);
  const discountAmount = Number.isFinite(parsedDiscount) && parsedDiscount > 0 ? parsedDiscount : 0;
  const discountError = getDiscountError();
  const totalWithDiscount = Math.max(total - discountAmount, 0);
  const cashAmount = Number(cashReceived);
  const hasValidCashAmount = cashReceived.trim() !== "" && Number.isFinite(cashAmount) && cashAmount >= 0;
  const change = hasValidCashAmount ? cashAmount - totalWithDiscount : 0;
  const cashAmountDue = paymentMethod === "cash" && hasValidCashAmount ? Math.max(totalWithDiscount - cashAmount, 0) : totalWithDiscount;
  const paymentBlockingMessage = getPaymentBlockingMessage();
  const canConfirmPayment = !paymentBlockingMessage && !loading;
  const hasActiveSale =
    cart.length > 0 ||
    Boolean(selectedCustomer) ||
    discountInput.trim() !== "" ||
    cashReceived.trim() !== "" ||
    paymentMethod !== "cash" ||
    Boolean(paymentSubmitError);

  function getDiscountError() {
    if (discountInput.trim() === "") return null;
    const value = Number(discountInput);
    if (!Number.isFinite(value)) return "Ingresa un descuento válido.";
    if (value < 0) return "El descuento no puede ser negativo.";
    if (value > total) return "El descuento no puede superar el subtotal.";
    return null;
  }

  function getPaymentBlockingMessage() {
    if (cart.length === 0) return "Agrega productos al carrito antes de cobrar.";
    if (discountError) return discountError;
    if (!Number.isFinite(totalWithDiscount) || totalWithDiscount <= 0) return "El total de la venta no es válido.";
    if (paymentMethod === "cash") {
      if (!hasValidCashAmount) return "Ingresa el monto recibido.";
      if (cashAmount < totalWithDiscount) {
        return `Faltan $${(totalWithDiscount - cashAmount).toLocaleString("es-CL")} para completar el pago.`;
      }
    }
    if (paymentMethod === "fiado" && !selectedCustomer) {
      return "Selecciona un cliente para registrar esta venta como fiada.";
    }
    return null;
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!hasActiveSale || success) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasActiveSale, success]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchCat = selectedCat ? p.categoryId === selectedCat : true;
    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchCat && matchSearch && p.active;
  }), [products, search, selectedCat]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return [];
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        (customer.phone && customer.phone.toLowerCase().includes(term)) ||
        (customer.rut && customer.rut.toLowerCase().includes(term)),
    );
  }, [customers, customerSearch]);

  const addToCart = useCallback(
    (product: any) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing)
          return prev.map((i) =>
            i.productId === product.id ? { ...i, qty: i.qty + 1 } : i,
          );
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            qty: 1,
            unit: product.unit,
          },
        ];
      });
      setSearch("");
      if (isMobile) setMobileTab("cart");
      else searchRef.current?.focus();
    },
    [isMobile],
  );

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0)
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    else
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
      );
  };

  const resetSaleState = useCallback((options?: { keepCompletedSale?: boolean }) => {
    setCart([]);
    setDiscountInput("");
    setCashReceived("");
    setSelectedCustomer(null);
    setCustomerSearch("");
    setPaymentMethod("cash");
    setPaymentSubmitError(null);
    setShowPayment(false);
    setShowNewCustomer(false);
    setShowCustomerList(false);
    setNewCustomer({ name: "", phone: "", rut: "" });
    setNewCustomerError(null);
    setSuccess(false);
    if (!options?.keepCompletedSale) setCompletedSale(null);
    if (!isMobile) searchRef.current?.focus();
  }, [isMobile]);

  const clearCart = useCallback(() => {
    resetSaleState();
  }, [resetSaleState]);

  async function loadHistory() {
    setLoadingHistory(true);
    const data = await fetch(`/api/sales/today?tenantId=${tenantId}`).then(
      (r) => r.json(),
    );
    setTodaySales(data);
    setLoadingHistory(false);
  }

  async function handleDeleteSale() {
    if (!deleteSale) return;
    setDeleteSaleLoading(true);
    try {
      const response = await fetch(`/api/sales/${deleteSale.id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Anulada desde historial POS" }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "void-sale-failed");
      }

      notify.success("Venta anulada correctamente.");
      setDeleteSale(null);
      await loadHistory();
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "";
      const message = rawMessage && rawMessage !== "void-sale-failed"
        ? rawMessage
        : "No pudimos anular la venta. No se realizaron cambios.";
      notify.error(message);
    } finally {
      setDeleteSaleLoading(false);
    }
  }

  async function handleGenerateSalePdf(sale: SaleHistoryItem) {
    if (generatingPdfSaleId === sale.id) return;
    setGeneratingPdfSaleId(sale.id);
    try {
      const res = await fetch(`/api/sales/${sale.id}`);
      if (!res.ok) throw new Error("receipt-fetch-failed");
      const data = await res.json();
      await generateReceipt(data.sale, data.items, data.settings, data.customer);
    } catch {
      notify.error("No pudimos generar el comprobante. Intentalo nuevamente.");
    } finally {
      setGeneratingPdfSaleId(null);
    }
  }

  async function handleNewCustomer() {
    if (newCustomerLoading) return;
    const trimmedCustomer = {
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      rut: newCustomer.rut.trim(),
    };

    if (!trimmedCustomer.name) {
      setNewCustomerError("Ingresa el nombre del cliente.");
      return;
    }

    setNewCustomerLoading(true);
    setNewCustomerError(null);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trimmedCustomer, tenantId }),
      });

      if (!response.ok) throw new Error("customer-create-failed");

      const customer = await response.json();
      setSelectedCustomer(customer);
      setCustomerSearch(customer.name);
      setShowNewCustomer(false);
      setShowCustomerList(false);
      setNewCustomer({ name: "", phone: "", rut: "" });
      notify.success("Cliente creado y seleccionado");
    } catch {
      const message = "No se pudo crear el cliente. Intenta nuevamente.";
      setNewCustomerError(message);
      notify.error(message);
    } finally {
      setNewCustomerLoading(false);
    }
  }

  async function handleCheckout() {
    if (loading) return;
    const blockingMessage = getPaymentBlockingMessage();
    if (blockingMessage) {
      setPaymentSubmitError(null);
      return;
    }
    setPaymentSubmitError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          userId,
          items: cart.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            price: i.price,
          })),
          total: totalWithDiscount,
          discount: discountAmount,
          paymentMethod,
          customerId: selectedCustomer?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("sale-post-failed");
      }

      const result = await response.json();
      setCompletedSale({
        saleId: result?.saleId,
        total: totalWithDiscount,
        paymentMethod,
        cashReceived: paymentMethod === "cash" ? Number(cashReceived) : null,
        change: paymentMethod === "cash" ? Math.max(change, 0) : 0,
        customerName: selectedCustomer?.name,
        itemCount: cart.length,
        isCreditSale: paymentMethod === "fiado",
      });
      setSuccess(true);
      setShowPayment(false);
      notify.success("Venta registrada correctamente.");
      window.setTimeout(() => resetSaleState({ keepCompletedSale: true }), 2000);
    } catch {
      const message = "No pudimos registrar la venta. Tu carrito se conserva para que puedas intentarlo nuevamente.";
      setPaymentSubmitError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
    setPaymentSubmitError(null);
  }

  function handleCashReceivedChange(value: string) {
    setCashReceived(value);
    setPaymentSubmitError(null);
  }

  function handleClosePayment() {
    if (loading) return;
    setShowPayment(false);
    setPaymentSubmitError(null);
  }

  function handleNewSale() {
    resetSaleState();
  }

  function handleSelectCustomerForCreditSale() {
    if (loading) return;
    setShowPayment(false);
    setPaymentSubmitError(null);
    setShowCustomerList(true);
    if (isMobile) setMobileTab("cart");
  }

  function requestClearSale() {
    if (loading || !hasActiveSale) return;
    setShowClearSaleConfirm(true);
  }

  function cancelClearSale() {
    if (loading) return;
    setShowClearSaleConfirm(false);
    if (!isMobile) searchRef.current?.focus();
  }

  function confirmClearSale() {
    if (loading) return;
    setShowClearSaleConfirm(false);
    clearCart();
  }

  function focusProductSearch() {
    if (isMobile) setMobileTab("products");
    requestAnimationFrame(() => {
      searchRef.current?.focus();
      searchRef.current?.select();
    });
  }

  function openPaymentFromShortcut() {
    setPaymentSubmitError(null);
    setShowPayment(true);
  }

  function handleBarcodeScan(code: string) {
    const normalizedCode = code.trim();
    const found = products.find((product) => product.barcode === normalizedCode);

    if (!found) {
      notify.warning("No se encontró un producto con el código escaneado.");
      if (!isMobile) searchRef.current?.focus();
      return;
    }

    addToCart(found);
    notify.success(`${found.name} agregado al carrito`);
  }

  usePosKeyboard({
    canOpenPayment: cart.length > 0,
    canClearSale: hasActiveSale,
    hasBlockingDialog: showClearSaleConfirm || Boolean(deleteSale) || showPayment || showHistory,
    loading,
    onCancelDeleteSale: () => {
      if (showClearSaleConfirm) {
        cancelClearSale();
        return;
      }
      if (deleteSaleLoading) return;
      setDeleteSale(null);
    },
    onClearCart: requestClearSale,
    onCloseCustomerDraft: () => setShowNewCustomer(false),
    onCloseHistory: () => setShowHistory(false),
    onClosePayment: handleClosePayment,
    onEmptyCartPayment: () => notify.info("Agrega productos al carrito antes de cobrar."),
    onFocusSearch: focusProductSearch,
    onOpenPayment: openPaymentFromShortcut,
    showCustomerDraft: showNewCustomer,
    showDeleteSaleConfirm: showClearSaleConfirm || Boolean(deleteSale),
    showHistory,
    showPayment,
  });

  useBarcodeScanner({
    disabled: loading || showClearSaleConfirm || Boolean(deleteSale) || showPayment || showHistory || showNewCustomer,
    onScan: handleBarcodeScan,
  });

  return (
    <div>
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
            height: 56,
          }}
        >
          <button
            onClick={() => setMobileTab("products")}
            style={{
              flex: 1,
              padding: "12px",
              background:
                mobileTab === "products" ? "var(--cyan)" : "transparent",
              color: mobileTab === "products" ? "var(--bg)" : "var(--muted)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            🛍️ Productos
          </button>
          <button
            onClick={() => setMobileTab("cart")}
            style={{
              flex: 1,
              padding: "12px",
              background: mobileTab === "cart" ? "var(--cyan)" : "transparent",
              color: mobileTab === "cart" ? "var(--bg)" : "var(--muted)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            🛒 {cart.length > 0 ? `Carrito (${cart.length})` : "Carrito"}
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(360px, 34vw)",
          height: isMobile ? "auto" : "100dvh",
          overflow: isMobile ? "visible" : "hidden",
          background: "var(--bg)",
        }}
      >
        {(!isMobile || mobileTab === "products") && (
          <ProductCatalog
            products={filteredProducts}
            categories={categories}
            selectedCat={selectedCat}
            setSelectedCat={setSelectedCat}
            search={search}
            setSearch={setSearch}
            searchRef={searchRef}
            isMobile={isMobile}
            addToCart={addToCart}
            setShowHistory={setShowHistory}
            loadHistory={loadHistory}
          />
        )}
        {(!isMobile || mobileTab === "cart") && (
          <CartPanel
            cart={cart}
            updateQty={updateQty}
            requestClearSale={requestClearSale}
            hasActiveSale={hasActiveSale}
            saleLocked={loading}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            filteredCustomers={filteredCustomers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            showCustomerList={showCustomerList}
            setShowCustomerList={setShowCustomerList}
            showNewCustomer={showNewCustomer}
            setShowNewCustomer={setShowNewCustomer}
            newCustomer={newCustomer}
            setNewCustomer={setNewCustomer}
            handleNewCustomer={handleNewCustomer}
            newCustomerLoading={newCustomerLoading}
            newCustomerError={newCustomerError}
            discountInput={discountInput}
            setDiscountInput={setDiscountInput}
            discountError={discountError}
            total={total}
            discountAmount={discountAmount}
            totalWithDiscount={totalWithDiscount}
            completedSale={completedSale}
            onNewSale={handleNewSale}
            isMobile={isMobile}
            setShowPayment={(open) => {
              if (open) setPaymentSubmitError(null);
              setShowPayment(open);
            }}
            setShowHistory={setShowHistory}
            loadHistory={loadHistory}
          />
        )}
      </div>

      <PaymentDialog
        open={showPayment}
        paymentMethods={PAYMENT_METHODS}
        paymentMethod={paymentMethod}
        cashReceived={cashReceived}
        change={change}
        total={totalWithDiscount}
        amountDue={cashAmountDue}
        loading={loading}
        selectedCustomer={selectedCustomer}
        blockingMessage={paymentBlockingMessage}
        submitError={paymentSubmitError}
        canConfirm={canConfirmPayment}
        onChangePaymentMethod={handlePaymentMethodChange}
        onChangeCashReceived={handleCashReceivedChange}
        onSelectCustomer={handleSelectCustomerForCreditSale}
        onClose={handleClosePayment}
        onConfirm={handleCheckout}
      />

      <ConfirmDialog
        open={showClearSaleConfirm}
        title="Cancelar venta en curso"
        description="Se eliminarán los productos, el cliente y el descuento de esta venta."
        cancelLabel="Seguir vendiendo"
        confirmLabel="Cancelar venta"
        variant="danger"
        loading={loading}
        onCancel={cancelClearSale}
        onConfirm={confirmClearSale}
      >
        <p>
          La venta contiene {cart.length} {cart.length === 1 ? "producto" : "productos"} por un total de $
          {totalWithDiscount.toLocaleString("es-CL")}.
          {selectedCustomer ? ` Cliente: ${selectedCustomer.name}.` : ""}
        </p>
      </ConfirmDialog>

      <SalesHistoryDialog
        open={showHistory}
        sales={todaySales}
        loading={loadingHistory}
        deleteSale={deleteSale}
        deleteLoading={deleteSaleLoading}
        generatingPdfSaleId={generatingPdfSaleId}
        onClose={() => setShowHistory(false)}
        onGeneratePdf={handleGenerateSalePdf}
        onRequestDelete={setDeleteSale}
        onCancelDelete={() => {
          if (deleteSaleLoading) return;
          setDeleteSale(null);
        }}
        onConfirmDelete={handleDeleteSale}
      />
    </div>
  );
}

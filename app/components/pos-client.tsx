/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  unit: string;
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo", icon: "💵" },
  { value: "debit", label: "Débito", icon: "💳" },
  { value: "credit", label: "Crédito", icon: "💳" },
  { value: "transfer", label: "Transferencia", icon: "🏦" },
  { value: "credit", label: "Fiado", icon: "📋" },
];

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
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    rut: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeTimer = useRef<any>(null);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalWithDiscount = total - discount;
  const change = Number(cashReceived) - totalWithDiscount;

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat ? p.categoryId === selectedCat : true;
    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchCat && matchSearch && p.active;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch)),
  );

  const addToCart = useCallback((product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
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
    searchRef.current?.focus();
  }, []);

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashReceived("");
    setSelectedCustomer(null);
    setCustomerSearch("");
    setPaymentMethod("cash");
    setSuccess(false);
    searchRef.current?.focus();
  };

  // Barcode scanner — detecta entrada rápida de pistola
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0) setShowPayment(true);
        return;
      }
      if (e.key === "Escape") {
        clearCart();
        return;
      }

      if (e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key);
        clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          setBarcodeBuffer((prev) => {
            if (prev.length > 3) {
              const found = products.find((p) => p.barcode === prev);
              if (found) addToCart(found);
            }
            return "";
          });
        }, 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, products, addToCart]);

  async function handleNewCustomer() {
    if (!newCustomer.name) return;
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newCustomer, tenantId }),
    });
    const customer = await res.json();
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setShowNewCustomer(false);
    setShowCustomerList(false);
    setNewCustomer({ name: "", phone: "", rut: "" });
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    setLoading(true);
    await fetch("/api/sales", {
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
        discount,
        paymentMethod,
        customerId: selectedCustomer?.id || null,
      }),
    });
    setLoading(false);
    setSuccess(true);
    setShowPayment(false);
    setTimeout(() => clearCart(), 2000);
  }

  const inputStyle: any = {
    padding: "10px 14px",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    width: "100%",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Panel izquierdo — productos */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Search + scanner */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg2)",
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
              }}
            >
              🔍
            </span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar por nombre, SKU o escanear código... (F2)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>

          {/* Categorías */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            <button
              onClick={() => setSelectedCat(null)}
              style={{
                padding: "6px 14px",
                borderRadius: 100,
                fontSize: 13,
                border: "1px solid var(--border)",
                cursor: "pointer",
                background:
                  selectedCat === null ? "var(--cyan)" : "transparent",
                color: selectedCat === null ? "var(--bg)" : "var(--muted)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCat(cat.id === selectedCat ? null : cat.id)
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 100,
                  fontSize: 13,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  background:
                    selectedCat === cat.id ? "var(--cyan)" : "transparent",
                  color: selectedCat === cat.id ? "var(--bg)" : "var(--muted)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 10,
            alignContent: "start",
          }}
        >
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                overflow: "hidden",
                transition: "border-color .15s, transform .1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--cyan)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Imagen */}
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: 90,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 90,
                    background: "var(--bg2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  📦
                </div>
              )}

              {/* Info */}
              <div style={{ padding: "10px 12px" }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text)",
                    marginBottom: 4,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.name}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--cyan)",
                  }}
                >
                  ${Number(p.price).toLocaleString("es-CL")}
                </p>
                <p
                  style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
                >
                  Stock: {Number(p.stock)} {p.unit}
                </p>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "48px",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Atajos */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
            display: "flex",
            gap: 16,
          }}
        >
          {[
            ["F2", "Buscar"],
            ["F4", "Cobrar"],
            ["ESC", "Limpiar"],
          ].map(([key, label]) => (
            <span key={key} style={{ fontSize: 12, color: "var(--muted)" }}>
              <span
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                  color: "var(--text)",
                  marginRight: 4,
                }}
              >
                {key}
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Panel derecho — carrito */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "var(--bg2)",
          overflow: "hidden",
        }}
      >
        {/* Header carrito */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Carrito {cart.length > 0 && `(${cart.length})`}
          </h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                fontSize: 12,
                color: "var(--danger)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              Agrega productos al carrito
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text)",
                    }}
                  >
                    {item.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--cyan)" }}>
                    ${item.price.toLocaleString("es-CL")} / {item.unit}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateQty(item.productId, Number(e.target.value))
                    }
                    style={{
                      width: 44,
                      textAlign: "center",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      fontSize: 14,
                      padding: "4px",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--cyan)",
                      border: "none",
                      color: "var(--bg)",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    +
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    minWidth: 64,
                    textAlign: "right",
                  }}
                >
                  ${(item.price * item.qty).toLocaleString("es-CL")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Cliente */}
        <div
          style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}
        >
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            Cliente (opcional)
          </p>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerList(true);
                if (!e.target.value) setSelectedCustomer(null);
              }}
              onFocus={() => setShowCustomerList(true)}
              style={inputStyle}
            />
            {showCustomerList && customerSearch && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  right: 0,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  zIndex: 50,
                  maxHeight: 180,
                  overflowY: "auto",
                  marginBottom: 4,
                }}
              >
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerSearch(c.name);
                      setShowCustomerList(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text)",
                      fontSize: 13,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {c.name} {c.phone && `· ${c.phone}`}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowNewCustomer(true);
                    setShowCustomerList(false);
                    setNewCustomer({ ...newCustomer, name: customerSearch });
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--cyan)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  + Registrar &quot;{customerSearch}&quot;
                </button>
              </div>
            )}
          </div>

          {showNewCustomer && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              <input
                placeholder="Nombre *"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                style={{ ...inputStyle, marginBottom: 6 }}
              />
              <input
                placeholder="Teléfono"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                style={{ ...inputStyle, marginBottom: 6 }}
              />
              <input
                placeholder="RUT"
                value={newCustomer.rut}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, rut: e.target.value })
                }
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setShowNewCustomer(false)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--muted)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNewCustomer}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "var(--cyan)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total y descuento */}
        <div
          style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Subtotal
            </span>
            <span style={{ fontSize: 13, color: "var(--text)" }}>
              ${total.toLocaleString("es-CL")}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Descuento
            </span>
            <input
              type="number"
              value={discount || ""}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
              style={{
                width: 100,
                padding: "4px 8px",
                textAlign: "right",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--cyan)",
              }}
            >
              ${totalWithDiscount.toLocaleString("es-CL")}
            </span>
          </div>
        </div>

        {/* Botón cobrar */}
        <div style={{ padding: "12px 16px", paddingBottom: 20 }}>
          {success ? (
            <div
              style={{
                padding: "14px",
                borderRadius: 10,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid var(--success)",
                textAlign: "center",
                color: "var(--success)",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              ✓ Venta registrada
            </div>
          ) : (
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              style={{
                width: "100%",
                padding: "14px",
                background:
                  cart.length === 0 ? "var(--surface)" : "var(--cyan)",
                color: cart.length === 0 ? "var(--muted)" : "var(--bg)",
                border: "none",
                borderRadius: 10,
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                transition: "background .2s",
              }}
            >
              Cobrar ${totalWithDiscount.toLocaleString("es-CL")} (F4)
            </button>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {showPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "32px",
              width: "100%",
              maxWidth: 420,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 24,
              }}
            >
              Método de pago
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {PAYMENT_METHODS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setPaymentMethod(m.value)}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    border: `1px solid ${paymentMethod === m.value ? "var(--cyan)" : "var(--border)"}`,
                    background:
                      paymentMethod === m.value
                        ? "rgba(14,165,233,0.1)"
                        : "transparent",
                    color:
                      paymentMethod === m.value
                        ? "var(--cyan)"
                        : "var(--muted)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === "cash" && (
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Monto recibido
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  autoFocus
                  style={inputStyle}
                />
                {Number(cashReceived) > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "10px 14px",
                      background:
                        change >= 0
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(239,68,68,0.1)",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>
                      Vuelto
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: change >= 0 ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      ${change.toLocaleString("es-CL")}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
                padding: "12px 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 16, color: "var(--muted)" }}>
                Total a cobrar
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--cyan)",
                }}
              >
                ${totalWithDiscount.toLocaleString("es-CL")}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowPayment(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--muted)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "12px",
                  background: "var(--cyan)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "Procesando..." : "Confirmar venta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

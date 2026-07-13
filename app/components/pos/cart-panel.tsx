/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import QuickCustomerDialog from "./quick-customer-dialog";
import SaleSuccessView from "./sale-success-view";
import type { CartPanelProps } from "./types";

export default function CartPanel({
  cart,
  updateQty,
  requestClearSale,
  hasActiveSale,
  saleLocked,
  customerSearch,
  setCustomerSearch,
  filteredCustomers,
  selectedCustomer,
  setSelectedCustomer,
  showCustomerList,
  setShowCustomerList,
  showNewCustomer,
  setShowNewCustomer,
  newCustomer,
  setNewCustomer,
  handleNewCustomer,
  newCustomerLoading,
  newCustomerError,
  discountInput,
  setDiscountInput,
  discountError,
  total,
  discountAmount,
  totalWithDiscount,
  completedSale,
  onNewSale,
  isMobile,
  setShowPayment,
  setShowHistory,
  loadHistory,
}: CartPanelProps) {
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
        display: "flex",
        flexDirection: "column",
        background: "color-mix(in srgb, var(--bg2) 94%, var(--surface))",
        overflow: "hidden",
        height: isMobile ? "calc(100dvh - 56px)" : "100dvh",
        borderLeft: isMobile ? "none" : "1px solid var(--border)",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Carrito {cart.length > 0 && `(${cart.length})`}
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hasActiveSale && (
            <span
              role="status"
              aria-live="polite"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                borderRadius: 999,
                border: "1px solid rgba(14,165,233,.28)",
                background: "rgba(14,165,233,.1)",
                color: "var(--cyan-l)",
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              <span aria-hidden="true">â€¢</span>
              Venta en curso
            </span>
          )}
          {isMobile && (
            <button
              onClick={() => {
                setShowHistory(true);
                loadHistory();
              }}
              style={{
                fontSize: 12,
                padding: "4px 10px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              Ventas
            </button>
          )}
          {hasActiveSale && (
            <button
              type="button"
              onClick={requestClearSale}
              disabled={saleLocked}
              aria-label="Cancelar venta en curso"
              style={{
                fontSize: 12,
                color: "var(--danger)",
                background: "none",
                border: "none",
                cursor: saleLocked ? "not-allowed" : "pointer",
                opacity: saleLocked ? 0.55 : 1,
              }}
            >
              Cancelar venta
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 18px", minHeight: 0 }}>
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--cyan)" }}>
                  ${item.price.toLocaleString("es-CL")} / {item.unit}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => updateQty(item.productId, item.qty - 1)}
                  disabled={saleLocked}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    cursor: saleLocked ? "not-allowed" : "pointer",
                    fontSize: 16,
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.qty}
                  disabled={saleLocked}
                  onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                  style={{
                    width: 40,
                    textAlign: "center",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text)",
                    fontSize: 13,
                    padding: "4px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => updateQty(item.productId, item.qty + 1)}
                  disabled={saleLocked}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "var(--cyan)",
                    border: "none",
                    color: "var(--bg)",
                    cursor: saleLocked ? "not-allowed" : "pointer",
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
                  minWidth: 60,
                  textAlign: "right",
                }}
              >
                ${(item.price * item.qty).toLocaleString("es-CL")}
              </p>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "14px 18px 18px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg2)",
          boxShadow: "0 -16px 36px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800, marginBottom: 2 }}>
              Cliente
            </p>
            <p style={{ fontSize: 11, color: "var(--muted)" }}>Opcional para ventas normales.</p>
          </div>
          {!selectedCustomer && customerSearch && (
            <button
              type="button"
              onClick={() => {
                if (saleLocked) return;
                setShowNewCustomer(true);
                setShowCustomerList(false);
              }}
              disabled={saleLocked}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--cyan)",
                cursor: saleLocked ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Crear cliente
            </button>
          )}
        </div>

        {selectedCustomer ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              display: "grid",
              gap: 8,
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(14,165,233,.28)",
              background: "rgba(14,165,233,.08)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "var(--cyan-l)", fontSize: 11, fontWeight: 900, marginBottom: 3 }}>
                Cliente seleccionado
              </p>
              <p style={{ color: "var(--text)", fontSize: 13, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedCustomer.name}
              </p>
              {(selectedCustomer.phone || selectedCustomer.rut) && (
                <p style={{ color: "var(--muted)", fontSize: 12 }}>
                  {selectedCustomer.phone || selectedCustomer.rut}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={saleLocked}
                onClick={() => {
                  if (saleLocked) return;
                  setSelectedCustomer(null);
                  setCustomerSearch("");
                  setShowCustomerList(true);
                }}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  cursor: saleLocked ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Cambiar
              </button>
              <button
                type="button"
                disabled={saleLocked}
                onClick={() => {
                  if (saleLocked) return;
                  setSelectedCustomer(null);
                  setCustomerSearch("");
                  setShowCustomerList(false);
                }}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,.28)",
                  background: "transparent",
                  color: "var(--danger)",
                  cursor: saleLocked ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o RUT"
              value={customerSearch}
              disabled={saleLocked}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setShowCustomerList(true);
              }}
              onFocus={() => setShowCustomerList(true)}
              style={inputStyle}
            />
            {customerSearch && (
              <button
                type="button"
                aria-label="Limpiar búsqueda de cliente"
                disabled={saleLocked}
                onClick={() => {
                  setCustomerSearch("");
                  setShowCustomerList(false);
                }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "0",
                  background: "transparent",
                  color: "var(--muted)",
                  cursor: saleLocked ? "not-allowed" : "pointer",
                }}
              >
                x
              </button>
            )}
            {showCustomerList && customerSearch && (
              <div
                id="pos-customer-results"
                role="listbox"
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
                  boxShadow: "0 14px 42px rgba(0,0,0,.28)",
                }}
              >
                {filteredCustomers.length === 0 ? (
                  <div style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 13 }}>
                    No hay clientes para esta búsqueda.
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => {
                        if (saleLocked) return;
                        setSelectedCustomer(customer);
                        setCustomerSearch(customer.name);
                        setShowCustomerList(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: saleLocked ? "not-allowed" : "pointer",
                        color: "var(--text)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>{customer.name}</span>
                      {(customer.phone || customer.rut) && (
                        <span style={{ display: "block", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                          {customer.phone || customer.rut}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          flexShrink: 0,
          padding: "0 18px 14px",
          background: "var(--bg2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Subtotal</span>
          <span style={{ fontSize: 13, color: "var(--text)" }}>${total.toLocaleString("es-CL")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label htmlFor="pos-discount" style={{ fontSize: 13, color: "var(--muted)" }}>Descuento</label>
          <input
            id="pos-discount"
            type="number"
            inputMode="decimal"
            min={0}
            max={total}
            value={discountInput}
            disabled={saleLocked}
            onChange={(e) => setDiscountInput(e.target.value)}
            placeholder="0"
            aria-invalid={Boolean(discountError)}
            aria-describedby={discountError ? "pos-discount-error" : undefined}
            style={{
              width: 90,
              padding: "4px 8px",
              textAlign: "right",
              background: "var(--surface)",
              border: `1px solid ${discountError ? "var(--warning)" : "var(--border)"}`,
              borderRadius: 6,
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        {discountAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Descuento aplicado</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>-${discountAmount.toLocaleString("es-CL")}</span>
          </div>
        )}
        {discountError && (
          <p id="pos-discount-error" role="alert" style={{ color: "var(--warning)", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            {discountError}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Total</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, color: "var(--cyan)" }}>
            ${totalWithDiscount.toLocaleString("es-CL")}
          </span>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "0 18px", paddingBottom: isMobile ? 16 : 20, background: "var(--bg2)" }}>
        {completedSale ? (
          <SaleSuccessView sale={completedSale} onNewSale={onNewSale} />
        ) : (
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0 || saleLocked || Boolean(discountError)}
            style={{
              width: "100%",
              minHeight: 56,
              padding: "16px",
              background: cart.length === 0 || discountError ? "var(--surface)" : "var(--cyan)",
              color: cart.length === 0 || discountError ? "var(--muted)" : "var(--bg)",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: ".01em",
              cursor: cart.length === 0 || saleLocked || discountError ? "not-allowed" : "pointer",
            }}
          >
            Cobrar ${totalWithDiscount.toLocaleString("es-CL")} {!isMobile && "(F4)"}
          </button>
        )}
      </div>
      <QuickCustomerDialog
        open={showNewCustomer}
        customer={newCustomer}
        loading={newCustomerLoading}
        error={newCustomerError}
        onChange={setNewCustomer}
        onClose={() => {
          if (saleLocked) return;
          setShowNewCustomer(false);
        }}
        onSubmit={handleNewCustomer}
      />
    </div>
  );
}

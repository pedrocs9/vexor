"use client";

import { useEffect, useRef } from "react";
import type { PaymentDialogProps } from "./types";

function formatCurrency(value: number) {
  return `$${Math.max(0, value).toLocaleString("es-CL")}`;
}

export default function PaymentDialog({
  open,
  paymentMethods,
  paymentMethod,
  cashReceived,
  change,
  total,
  amountDue,
  loading,
  selectedCustomer,
  blockingMessage,
  submitError,
  canConfirm,
  onChangePaymentMethod,
  onChangeCashReceived,
  onSelectCustomer,
  onClose,
  onConfirm,
}: PaymentDialogProps) {
  const cashInputRef = useRef<HTMLInputElement>(null);
  const firstMethodRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    if (paymentMethod === "cash") cashInputRef.current?.focus();
    else firstMethodRef.current?.focus();
  }, [open, paymentMethod]);

  if (!open) return null;

  const isCash = paymentMethod === "cash";
  const isCreditSale = paymentMethod === "fiado";
  const describedBy = [
    blockingMessage ? "pos-payment-blocking-message" : null,
    submitError ? "pos-payment-submit-error" : null,
    isCash ? "pos-payment-cash-help" : null,
  ]
    .filter(Boolean)
    .join(" ");

  function handleCashChange(value: string) {
    if (value === "") {
      onChangeCashReceived("");
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onChangeCashReceived(value);
  }

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-payment-title"
        aria-describedby={describedBy || undefined}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: "min(100%, 460px)",
          maxHeight: "calc(100dvh - 32px)",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,.38)",
        }}
      >
        <div
          style={{
            padding: "22px 22px 16px",
            borderBottom: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--surface) 92%, var(--cyan) 8%)",
          }}
        >
          <p
            style={{
              color: "var(--muted)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".06em",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Total a pagar
          </p>
          <h2
            id="pos-payment-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 34,
              lineHeight: 1,
              fontWeight: 800,
              color: "var(--cyan)",
            }}
          >
            {formatCurrency(total)}
          </h2>
        </div>

        <div style={{ overflowY: "auto", padding: 22 }}>
          <section aria-labelledby="pos-payment-method-title">
            <h3
              id="pos-payment-method-title"
              style={{
                color: "var(--text)",
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Medio de pago
            </h3>
            <div
              role="group"
              aria-label="Seleccionar medio de pago"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {paymentMethods.map((method, index) => {
                const selected = paymentMethod === method.value;
                return (
                  <button
                    key={method.value}
                    ref={index === 0 ? firstMethodRef : undefined}
                    type="button"
                    aria-pressed={selected}
                    disabled={loading}
                    onClick={() => onChangePaymentMethod(method.value)}
                    style={{
                      minHeight: 48,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${selected ? "var(--cyan)" : "var(--border)"}`,
                      background: selected ? "rgba(14,165,233,0.12)" : "var(--bg2)",
                      color: selected ? "var(--cyan)" : "var(--text)",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.72 : 1,
                      fontSize: 13,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      outlineOffset: 3,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span aria-hidden="true">{method.icon}</span>
                      {method.label}
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: `1px solid ${selected ? "var(--cyan)" : "var(--border)"}`,
                        display: "grid",
                        placeItems: "center",
                        color: "var(--cyan)",
                        fontSize: 12,
                      }}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {isCash && (
            <section aria-labelledby="pos-payment-cash-title" style={{ marginBottom: 16 }}>
              <label
                id="pos-payment-cash-title"
                htmlFor="pos-payment-cash"
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 7,
                  fontWeight: 700,
                }}
              >
                Monto recibido
              </label>
              <input
                ref={cashInputRef}
                id="pos-payment-cash"
                type="number"
                inputMode="decimal"
                min={0}
                value={cashReceived}
                disabled={loading}
                onChange={(e) => handleCashChange(e.target.value)}
                placeholder="0"
                aria-invalid={Boolean(blockingMessage)}
                aria-describedby="pos-payment-cash-help"
                style={{
                  padding: "13px 14px",
                  background: "var(--bg2)",
                  border: `1px solid ${blockingMessage ? "var(--danger)" : "var(--border)"}`,
                  borderRadius: 10,
                  color: "var(--text)",
                  fontSize: 16,
                  outline: "none",
                  width: "100%",
                }}
              />
              <div
                id="pos-payment-cash-help"
                aria-live="polite"
                style={{
                  marginTop: 10,
                  padding: "11px 12px",
                  background: amountDue > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                  border: `1px solid ${amountDue > 0 ? "rgba(239,68,68,0.28)" : "rgba(16,185,129,0.28)"}`,
                  borderRadius: 10,
                  color: amountDue > 0 ? "var(--danger)" : "var(--success)",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {amountDue > 0 ? `Faltan ${formatCurrency(amountDue)} para completar el pago.` : `Vuelto: ${formatCurrency(change)}`}
              </div>
            </section>
          )}

          {isCreditSale && (
            <section
              style={{
                marginBottom: 16,
                padding: "12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg2)",
              }}
            >
              <p style={{ color: "var(--text)", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                Venta fiada
              </p>
              {selectedCustomer ? (
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--text)" }}>{selectedCustomer.name}</strong>
                  {(selectedCustomer.phone || selectedCustomer.rut) && (
                    <span>
                      {" "}
                      · {selectedCustomer.phone || selectedCustomer.rut}
                    </span>
                  )}
                  <p>Se registrará una deuda asociada a este cliente.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <p style={{ color: "var(--warning)", fontSize: 13, fontWeight: 700 }}>
                    Selecciona un cliente para registrar esta venta como fiada.
                  </p>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onSelectCustomer}
                    style={{
                      justifySelf: "start",
                      padding: "8px 12px",
                      borderRadius: 9,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--cyan)",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: 800,
                    }}
                  >
                    Seleccionar cliente
                  </button>
                </div>
              )}
            </section>
          )}

          {blockingMessage && (
            <div
              id="pos-payment-blocking-message"
              role="status"
              style={{
                padding: "11px 12px",
                borderRadius: 10,
                border: "1px solid rgba(245,158,11,.3)",
                background: "rgba(245,158,11,.1)",
                color: "var(--warning)",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: submitError ? 10 : 0,
              }}
            >
              {blockingMessage}
            </div>
          )}

          {submitError && (
            <div
              id="pos-payment-submit-error"
              role="alert"
              style={{
                padding: "11px 12px",
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,.3)",
                background: "rgba(239,68,68,.1)",
                color: "var(--danger)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {submitError}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: 10,
            padding: 16,
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "12px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--muted)",
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            aria-busy={loading}
            style={{
              padding: "12px",
              background: !canConfirm || loading ? "color-mix(in srgb, var(--cyan) 45%, var(--bg2))" : "var(--cyan)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 10,
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 800,
              cursor: !canConfirm || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading && (
              <span
                aria-hidden="true"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(2,6,23,.35)",
                  borderTopColor: "var(--bg)",
                  animation: "pos-payment-spin .7s linear infinite",
                }}
              />
            )}
            {loading ? "Procesando venta" : "Confirmar venta"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes pos-payment-spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 520px) {
          [role="dialog"][aria-labelledby="pos-payment-title"] {
            align-self: stretch;
            max-height: calc(100dvh - 20px);
          }
        }
      `}</style>
    </div>
  );
}

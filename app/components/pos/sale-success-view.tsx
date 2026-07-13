"use client";

import { useEffect, useRef } from "react";
import type { SaleSuccessViewProps } from "./types";

const paymentLabels = {
  cash: "Efectivo",
  debit: "Débito",
  credit: "Crédito",
  transfer: "Transferencia",
  fiado: "Fiado",
};

function formatCurrency(value: number) {
  return `$${Math.max(0, value).toLocaleString("es-CL")}`;
}

export default function SaleSuccessView({ sale, onNewSale }: SaleSuccessViewProps) {
  const newSaleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    newSaleRef.current?.focus();
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(16,185,129,.34)",
        background: "rgba(16,185,129,.1)",
      }}
    >
      <div>
        <p style={{ color: "var(--success)", fontSize: 13, fontWeight: 900, marginBottom: 4 }}>
          {sale.isCreditSale ? "Venta fiada registrada" : "Venta registrada correctamente"}
        </p>
        {sale.saleId && (
          <p style={{ color: "var(--muted)", fontSize: 12 }}>Venta #{sale.saleId}</p>
        )}
      </div>

      <div>
        <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 800 }}>Total</p>
        <p style={{ color: "var(--text)", fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900 }}>
          {formatCurrency(sale.total)}
        </p>
      </div>

      <div style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 13 }}>
        <p>
          Medio de pago: <strong style={{ color: "var(--text)" }}>{paymentLabels[sale.paymentMethod]}</strong>
        </p>
        {sale.customerName && (
          <p>
            Cliente: <strong style={{ color: "var(--text)" }}>{sale.customerName}</strong>
          </p>
        )}
        <p>{sale.itemCount} {sale.itemCount === 1 ? "producto" : "productos"} en la venta.</p>
      </div>

      {sale.paymentMethod === "cash" && sale.change > 0 && (
        <div
          style={{
            padding: "12px",
            borderRadius: 10,
            border: "1px solid rgba(14,165,233,.28)",
            background: "rgba(14,165,233,.1)",
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 800 }}>Vuelto a entregar</p>
          <p style={{ color: "var(--cyan)", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900 }}>
            {formatCurrency(sale.change)}
          </p>
        </div>
      )}

      {sale.isCreditSale && (
        <p style={{ color: "var(--warning)", fontSize: 13, fontWeight: 800 }}>
          Se registró una deuda asociada al cliente.
        </p>
      )}

      <button
        ref={newSaleRef}
        type="button"
        onClick={onNewSale}
        style={{
          minHeight: 46,
          padding: "12px",
          borderRadius: 10,
          border: "none",
          background: "var(--cyan)",
          color: "var(--bg)",
          cursor: "pointer",
          fontFamily: "var(--font-display)",
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        Nueva venta
      </button>
    </div>
  );
}

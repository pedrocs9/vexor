"use client";

import ConfirmDialog from "../ui/confirm-dialog";
import type { SaleHistoryItem, SalesHistoryDialogProps } from "./types";

function SaleRow({
  sale,
  onGeneratePdf,
  onRequestDelete,
}: {
  sale: SaleHistoryItem;
  onGeneratePdf: (sale: SaleHistoryItem) => void | Promise<void>;
  onRequestDelete: (sale: SaleHistoryItem) => void;
}) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {new Date(sale.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 100,
              background: sale.status === "completed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              color: sale.status === "completed" ? "var(--success)" : "var(--warning)",
            }}
          >
            {sale.status === "completed" ? "Completada" : "Fiado"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            ${Number(sale.total).toLocaleString("es-CL")}
          </span>
          <button
            onClick={() => onGeneratePdf(sale)}
            style={{
              fontSize: 11,
              padding: "3px 8px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            🖨️ PDF
          </button>
          <button
            aria-label="Eliminar venta"
            onClick={() => onRequestDelete(sale)}
            style={{
              fontSize: 11,
              padding: "3px 8px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--danger)",
              cursor: "pointer",
            }}
          >
            🗑️
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {sale.items.map((item, j) => (
          <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
            <span>
              {item.productName} × {Number(item.qty).toFixed(1)}
            </span>
            <span>${Number(item.subtotal).toLocaleString("es-CL")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesHistoryDialog({
  open,
  sales,
  loading,
  deleteSale,
  deleteLoading,
  onClose,
  onGeneratePdf,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: SalesHistoryDialogProps) {
  if (!open) {
    return (
      <ConfirmDialog
        open={Boolean(deleteSale)}
        title="Eliminar venta"
        description="Esta venta se eliminará del historial de hoy. Esta acción no se puede deshacer."
        confirmLabel="Eliminar venta"
        variant="danger"
        loading={deleteLoading}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    );
  }

  const total = sales.reduce((s, sale) => s + Number(sale.total), 0);

  return (
    <>
      <div
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
          aria-labelledby="pos-history-title"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "24px",
            width: "100%",
            maxWidth: 600,
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2
              id="pos-history-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Ventas del día
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--muted)",
              }}
            >
              ✕
            </button>
          </div>
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}>Cargando...</p>
          ) : sales.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}>Aún no hay ventas hoy.</p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--bg2)",
                  borderRadius: 8,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{sales.length} ventas</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--cyan)" }}>
                  Total: ${total.toLocaleString("es-CL")}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sales.map((sale) => (
                  <SaleRow
                    key={sale.id}
                    sale={sale}
                    onGeneratePdf={onGeneratePdf}
                    onRequestDelete={onRequestDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteSale)}
        title="Eliminar venta"
        description="Esta venta se eliminará del historial de hoy. Esta acción no se puede deshacer."
        confirmLabel="Eliminar venta"
        variant="danger"
        loading={deleteLoading}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}

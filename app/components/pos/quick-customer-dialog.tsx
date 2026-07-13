"use client";

import { useRef } from "react";
import Button from "../ui/button";
import Modal from "../ui/modal";
import type { NewCustomerDraft } from "./types";

type QuickCustomerDialogProps = {
  customer: NewCustomerDraft;
  error: string | null;
  loading: boolean;
  open: boolean;
  onChange: (customer: NewCustomerDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg2)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
};

export default function QuickCustomerDialog({
  customer,
  error,
  loading,
  open,
  onChange,
  onClose,
  onSubmit,
}: QuickCustomerDialogProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  return (
    <Modal
      title="Crear cliente rápido"
      description="Agrega los datos básicos y vuelve a la venta sin salir del POS."
      onClose={() => {
        if (!loading) onClose();
      }}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      initialFocusRef={nameRef}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, width: "100%" }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSubmit} isLoading={loading} loadingText="Creando">
            Crear cliente
          </Button>
        </div>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
          Nombre
          <input
            ref={nameRef}
            value={customer.name}
            disabled={loading}
            autoComplete="name"
            aria-invalid={Boolean(error && !customer.name.trim())}
            onChange={(event) => onChange({ ...customer, name: event.target.value })}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
          Teléfono
          <input
            value={customer.phone}
            disabled={loading}
            autoComplete="tel"
            onChange={(event) => onChange({ ...customer, phone: event.target.value })}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
          RUT
          <input
            value={customer.rut}
            disabled={loading}
            autoComplete="off"
            onChange={(event) => onChange({ ...customer, rut: event.target.value })}
            style={inputStyle}
          />
        </label>
        {error && (
          <p role="alert" style={{ color: "var(--danger)", fontSize: 13, fontWeight: 700 }}>
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

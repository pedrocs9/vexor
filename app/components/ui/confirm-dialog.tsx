 "use client";

import { useRef } from "react";
import Button from "./button";
import Modal from "./modal";

type ConfirmVariant = "danger" | "warning" | "info";

type ConfirmDialogProps = {
  cancelLabel?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  description: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  open: boolean;
  title: string;
  variant?: ConfirmVariant;
};

const variantText: Record<ConfirmVariant, string> = {
  danger: "Accion destructiva",
  warning: "Revisar antes de continuar",
  info: "Confirmacion",
};

export default function ConfirmDialog({
  cancelLabel = "Cancelar",
  children,
  confirmLabel = "Confirmar",
  description,
  icon,
  loading = false,
  onCancel,
  onConfirm,
  open,
  title,
  variant = "info",
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  if (!open) return null;

  return (
    <Modal
      title={title}
      description={description}
      onClose={() => {
        if (!loading) onCancel();
      }}
      size="medium"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      initialFocusRef={cancelRef}
      footer={
        <div className="confirm-dialog__footer">
          <Button ref={cancelRef} variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={loading}
            loadingText="Procesando"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className={`confirm-dialog confirm-dialog--${variant}`}>
        <div className="confirm-dialog__icon" aria-hidden="true">
          {icon ?? (variant === "danger" ? "!" : variant === "warning" ? "?" : "i")}
        </div>
        <div>
          <p className="confirm-dialog__kicker">{variantText[variant]}</p>
          {children && <div className="confirm-dialog__content">{children}</div>}
        </div>
      </div>
      <style>{`
        .confirm-dialog {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }
        .confirm-dialog__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          font-family: var(--font-display), var(--font-body), sans-serif;
          font-weight: 900;
        }
        .confirm-dialog--danger .confirm-dialog__icon {
          color: var(--danger);
          background: rgba(239,68,68,.1);
          border-color: rgba(239,68,68,.32);
        }
        .confirm-dialog--warning .confirm-dialog__icon {
          color: var(--warning);
          background: rgba(245,158,11,.1);
          border-color: rgba(245,158,11,.32);
        }
        .confirm-dialog--info .confirm-dialog__icon {
          color: var(--cyan-l);
          background: rgba(14,165,233,.1);
          border-color: rgba(14,165,233,.32);
        }
        .confirm-dialog__kicker {
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .confirm-dialog__content {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.55;
        }
        .confirm-dialog__footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
        }
        @media (max-width: 640px) {
          .confirm-dialog__footer {
            flex-direction: column-reverse;
          }
          .confirm-dialog__footer .v-btn {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
}

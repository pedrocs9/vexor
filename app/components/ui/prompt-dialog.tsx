 "use client";

import { useId, useMemo, useRef } from "react";
import Button from "./button";
import Modal from "./modal";

type PromptDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  defaultValue?: string;
  description?: string;
  label: string;
  loading?: boolean;
  onCancel: () => void;
  onChange: (value: string) => void;
  onConfirm: () => void | Promise<void>;
  open: boolean;
  placeholder?: string;
  title: string;
  validate?: (value: string) => string | null;
  value: string;
};

export default function PromptDialog({
  cancelLabel = "Cancelar",
  confirmLabel = "Aceptar",
  description,
  label,
  loading = false,
  onCancel,
  onChange,
  onConfirm,
  open,
  placeholder,
  title,
  validate,
  value,
}: PromptDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const error = useMemo(() => validate?.(value) ?? null, [validate, value]);

  if (!open) return null;

  return (
    <Modal
      title={title}
      description={description}
      onClose={() => {
        if (!loading) onCancel();
      }}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      initialFocusRef={inputRef}
      footer={
        <div className="prompt-dialog__footer">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={loading}
            loadingText="Guardando"
            disabled={Boolean(error)}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="prompt-dialog">
        <label className="prompt-dialog__label" htmlFor={inputId}>{label}</label>
        <input
          ref={inputRef}
          id={inputId}
          className="prompt-dialog__input"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && <p className="prompt-dialog__error" id={`${inputId}-error`}>{error}</p>}
      </div>
      <style>{`
        .prompt-dialog {
          display: grid;
          gap: 8px;
        }
        .prompt-dialog__label {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
        }
        .prompt-dialog__input {
          width: 100%;
          min-height: var(--control-h);
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg);
          color: var(--text);
          font: inherit;
          outline: none;
        }
        .prompt-dialog__input:focus {
          border-color: var(--cyan);
          box-shadow: var(--focus-ring);
        }
        .prompt-dialog__input[aria-invalid="true"] {
          border-color: var(--danger);
        }
        .prompt-dialog__error {
          color: var(--danger);
          font-size: 12px;
        }
        .prompt-dialog__footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
        }
        @media (max-width: 640px) {
          .prompt-dialog__footer {
            flex-direction: column-reverse;
          }
          .prompt-dialog__footer .v-btn {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
}

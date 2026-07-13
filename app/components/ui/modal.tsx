 "use client";

import { useEffect, useId } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  size?: "medium" | "wide";
  title: string;
  description?: string;
};

export default function Modal({
  ariaLabel,
  children,
  className = "",
  closeOnBackdrop = false,
  closeOnEscape = true,
  description,
  footer,
  initialFocusRef,
  onClose,
  size = "medium",
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [initialFocusRef]);

  useEffect(() => {
    if (!closeOnEscape) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeOnEscape, onClose]);

  return (
    <div
      className="v-modal-backdrop"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-label={ariaLabel ?? title}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-modal="true"
        className={`v-modal v-modal--${size} ${className}`.trim()}
        role="dialog"
      >
        <div className="v-modal__header">
          <div>
            <h2 className="v-modal__title" id={titleId}>{title}</h2>
            {description && <p className="v-modal__description" id={descriptionId}>{description}</p>}
          </div>
          <button
            aria-label="Cerrar modal"
            className="v-modal__close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
        <div className="v-modal__body">
          {children}
          {footer && <div className="v-modal__footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

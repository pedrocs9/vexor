"use client";

import { useEffect, useRef } from "react";
import { isEditableTarget } from "./keyboard-target";

type PosKeyboardOptions = {
  canOpenPayment: boolean;
  canClearSale: boolean;
  hasBlockingDialog: boolean;
  loading: boolean;
  onClearCart: () => void;
  onCloseCustomerDraft: () => void;
  onCloseHistory: () => void;
  onClosePayment: () => void;
  onEmptyCartPayment: () => void;
  onFocusSearch: () => void;
  onOpenPayment: () => void;
  onCancelDeleteSale: () => void;
  showCustomerDraft: boolean;
  showDeleteSaleConfirm: boolean;
  showHistory: boolean;
  showPayment: boolean;
};

export function usePosKeyboard(options: PosKeyboardOptions) {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const current = optionsRef.current;
      const editableTarget = isEditableTarget(event.target);
      const hasModalOpen = current.showDeleteSaleConfirm || current.showPayment || current.showHistory;

      if (event.key === "Escape") {
        if (current.showDeleteSaleConfirm) {
          event.preventDefault();
          current.onCancelDeleteSale();
          return;
        }

        if (current.showPayment) {
          event.preventDefault();
          if (!current.loading) current.onClosePayment();
          return;
        }

        if (current.showHistory) {
          event.preventDefault();
          current.onCloseHistory();
          return;
        }

        if (current.showCustomerDraft) {
          event.preventDefault();
          current.onCloseCustomerDraft();
          return;
        }

        if (!current.hasBlockingDialog && current.canClearSale) {
          event.preventDefault();
          current.onClearCart();
        }
        return;
      }

      if (event.key === "F2") {
        if (editableTarget || hasModalOpen) return;
        event.preventDefault();
        current.onFocusSearch();
        return;
      }

      if (event.key === "F4") {
        if (editableTarget || hasModalOpen || current.loading) return;
        event.preventDefault();
        if (current.canOpenPayment) current.onOpenPayment();
        else current.onEmptyCartPayment();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

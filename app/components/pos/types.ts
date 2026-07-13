/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RefObject } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  unit: string;
};

export type PosCustomer = {
  id: number;
  name: string;
  phone?: string | null;
  rut?: string | null;
};

export type NewCustomerDraft = {
  name: string;
  phone: string;
  rut: string;
};

export type ProductCatalogProps = {
  products: any[];
  categories: any[];
  selectedCat: number | null;
  setSelectedCat: (id: number | null) => void;
  search: string;
  setSearch: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  isMobile: boolean;
  addToCart: (product: any) => void;
  setShowHistory: (open: boolean) => void;
  loadHistory: () => void;
};

export type CartPanelProps = {
  cart: CartItem[];
  updateQty: (productId: number, qty: number) => void;
  requestClearSale: () => void;
  hasActiveSale: boolean;
  saleLocked: boolean;
  customerSearch: string;
  setCustomerSearch: (value: string) => void;
  filteredCustomers: PosCustomer[];
  selectedCustomer: PosCustomer | null;
  setSelectedCustomer: (customer: PosCustomer | null) => void;
  showCustomerList: boolean;
  setShowCustomerList: (open: boolean) => void;
  showNewCustomer: boolean;
  setShowNewCustomer: (open: boolean) => void;
  newCustomer: NewCustomerDraft;
  setNewCustomer: (customer: NewCustomerDraft) => void;
  handleNewCustomer: () => void;
  newCustomerLoading: boolean;
  newCustomerError: string | null;
  discountInput: string;
  setDiscountInput: (value: string) => void;
  discountError: string | null;
  total: number;
  discountAmount: number;
  totalWithDiscount: number;
  success: boolean;
  isMobile: boolean;
  setShowPayment: (open: boolean) => void;
  setShowHistory: (open: boolean) => void;
  loadHistory: () => void;
};

export type PaymentMethod = "cash" | "debit" | "credit" | "transfer" | "fiado";

export type PaymentOption = {
  value: PaymentMethod;
  label: string;
  icon: string;
};

export type PaymentCustomer = {
  id: number;
  name: string;
  phone?: string | null;
  rut?: string | null;
};

export type PaymentDialogProps = {
  open: boolean;
  paymentMethods: PaymentOption[];
  paymentMethod: PaymentMethod;
  cashReceived: string;
  change: number;
  total: number;
  amountDue: number;
  loading: boolean;
  selectedCustomer: PaymentCustomer | null;
  blockingMessage: string | null;
  submitError: string | null;
  canConfirm: boolean;
  onChangePaymentMethod: (value: PaymentMethod) => void;
  onChangeCashReceived: (value: string) => void;
  onSelectCustomer: () => void;
  onClose: () => void;
  onConfirm: () => void;
};

export type SaleHistoryItem = {
  id: number;
  total: string | number;
  status: string;
  createdAt: string | Date;
  items: Array<{
    productName: string | null;
    qty: string | number;
    subtotal: string | number;
  }>;
};

export type SalesHistoryDialogProps = {
  open: boolean;
  sales: SaleHistoryItem[];
  loading: boolean;
  deleteSale: SaleHistoryItem | null;
  deleteLoading: boolean;
  onClose: () => void;
  onGeneratePdf: (sale: SaleHistoryItem) => void | Promise<void>;
  onRequestDelete: (sale: SaleHistoryItem) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void | Promise<void>;
};

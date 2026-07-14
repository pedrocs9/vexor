/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useState } from "react";
import ImageUpload from "./image-upload";
import ImportProducts from "./import-products";
import { notify } from "./toast";
import Badge from "./ui/badge";
import Button from "./ui/button";
import ConfirmDialog from "./ui/confirm-dialog";
import EmptyState from "./ui/empty-state";
import PageHeader from "./ui/page-header";
import PromptDialog from "./ui/prompt-dialog";
import Surface from "./ui/surface";

const inputStyle: any = {
  padding: "10px 14px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  width: "100%",
};

const labelStyle: any = {
  fontSize: 12,
  color: "var(--muted)",
  display: "block",
  marginBottom: 6,
  fontWeight: 650,
};

function ProductPlaceholder() {
  return (
    <div className="product-image-placeholder" aria-hidden="true">
      <span />
    </div>
  );
}

function getStockState(product: any) {
  const stock = Number(product.stock);
  const minStock = Number(product.minStock);

  if (stock === 0) {
    return { label: "Sin stock", className: "stock-zero" };
  }

  if (minStock > 0 && stock <= minStock) {
    return { label: "Stock bajo", className: "stock-low" };
  }

  return { label: "Disponible", className: "stock-ok" };
}

function FormFields({
  data,
  onChange,
  categories,
  onImageUploadingChange,
}: {
  data: any;
  onChange: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  onImageUploadingChange?: (uploading: boolean) => void;
}) {
  return (
    <>
      <section className="product-form-section">
        <div>
          <h3>Identificacion</h3>
          <p>Datos visibles para venta, busqueda e inventario.</p>
        </div>
        <div className="product-form-grid">
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              required
              style={inputStyle}
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>SKU</label>
            <input
              style={inputStyle}
              value={data.sku}
              onChange={(e) => onChange({ ...data, sku: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Codigo de barras</label>
            <input
              style={inputStyle}
              value={data.barcode}
              onChange={(e) => onChange({ ...data, barcode: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <select
              style={inputStyle}
              value={data.categoryId}
              onChange={(e) => onChange({ ...data, categoryId: e.target.value })}
            >
              <option value="">Sin categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div>
          <h3>Precio y stock</h3>
          <p>Valores usados por el punto de venta y alertas operativas.</p>
        </div>
        <div className="product-form-grid">
          <div>
            <label style={labelStyle}>Precio venta *</label>
            <input
              required
              type="number"
              style={inputStyle}
              value={data.price}
              onChange={(e) => onChange({ ...data, price: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Costo</label>
            <input
              type="number"
              style={inputStyle}
              value={data.cost}
              onChange={(e) => onChange({ ...data, cost: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Stock actual *</label>
            <input
              required
              type="number"
              style={inputStyle}
              value={data.stock}
              onChange={(e) => onChange({ ...data, stock: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Stock minimo</label>
            <input
              type="number"
              style={inputStyle}
              value={data.minStock}
              onChange={(e) => onChange({ ...data, minStock: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Unidad</label>
            <select
              style={inputStyle}
              value={data.unit}
              onChange={(e) => onChange({ ...data, unit: e.target.value })}
            >
              <option value="un">Unidad</option>
              <option value="kg">Kilogramo</option>
              <option value="lt">Litro</option>
              <option value="caja">Caja</option>
              <option value="saco">Saco</option>
            </select>
          </div>
        </div>
      </section>

      <section className="product-form-section">
        <div>
          <h3>Imagen</h3>
          <p>Ayuda a reconocer productos rapidamente en inventario y POS.</p>
        </div>
        <div>
          {data.imageUrl && (
            <img
              src={data.imageUrl}
              alt="producto"
              className="product-form-image"
            />
          )}
          <ImageUpload
            onUpload={(url) =>
              onChange((current: any) => ({ ...current, imageUrl: url }))
            }
            onUploadingChange={onImageUploadingChange}
          />
        </div>
      </section>
    </>
  );
}

function Modal({
  title,
  subtitle,
  onSubmit,
  onClose,
  data,
  onChange,
  categories,
  submitLabel,
  isLoading,
  isImageUploading,
}: any) {
  return (
    <div className="inventory-modal-backdrop">
      <div className="inventory-modal inventory-modal-wide">
        <div className="inventory-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-close"
            aria-label="Cerrar modal"
          >
            x
          </button>
        </div>
        <form onSubmit={onSubmit} className="inventory-modal-body">
          <FormFields
            data={data}
            onChange={onChange}
            categories={categories}
            onImageUploadingChange={isImageUploading?.onChange}
          />
          <div className="inventory-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={isImageUploading?.value}
              isLoading={isLoading || isImageUploading?.value}
              loadingText={isImageUploading?.value ? "Subiendo imagen" : "Guardando"}
              variant="primary"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsClient({
  products,
  categories,
  tenantId,
}: {
  products: any[];
  categories: any[];
  tenantId: number;
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<any>(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<any>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [categoryPromptOpen, setCategoryPromptOpen] = useState(false);
  const [categoryPromptValue, setCategoryPromptValue] = useState("");
  const [categoryPromptLoading, setCategoryPromptLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [adjustForm, setAdjustForm] = useState({
    type: "add",
    qty: "",
    reason: "",
    note: "",
  });
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    unit: "un",
    categoryId: "",
    barcode: "",
    imageUrl: "",
  });

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory
      ? String(p.categoryId) === filterCategory
      : true;
    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? p.active
          : !p.active;
    const matchStock =
      filterStock === "all"
        ? true
        : filterStock === "low"
          ? Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0
          : filterStock === "zero"
            ? Number(p.stock) === 0
            : true;
    return matchSearch && matchCategory && matchStatus && matchStock;
  });

  const lowStockCount = products.filter(
    (p) => Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0,
  ).length;
  const zeroStockCount = products.filter((p) => Number(p.stock) === 0).length;
  const inactiveCount = products.filter((p) => !p.active).length;
  const hasActiveFilters =
    search !== "" ||
    filterCategory !== "" ||
    filterStatus !== "active" ||
    filterStock !== "all";

  function clearFilters() {
    setSearch("");
    setFilterCategory("");
    setFilterStatus("active");
    setFilterStock("all");
  }

  function categoryName(categoryId: number | string | null | undefined) {
    const category = categories.find((c) => String(c.id) === String(categoryId));
    return category?.name ?? "Sin categoria";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageUploading) {
      notify.error("Espera a que termine de subir la imagen");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tenantId }),
    });
    setLoading(false);
    if (res.ok) {
      notify.success("Producto guardado correctamente");
      setShowForm(false);
      // refresca los datos sin recargar
      window.location.reload();
    } else {
      notify.error("Error al guardar producto");
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editImageUploading) {
      notify.error("Espera a que termine de subir la imagen");
      return;
    }
    setEditLoading(true);
    const res = await fetch(`/api/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditLoading(false);

    if (res.ok) {
      notify.success("Producto editado correctamente");
      setEditProduct(null);
      // refresca los datos sin recargar
      window.location.reload();
    } else {
      notify.error("Error al guardar producto");
    }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    setAdjustLoading(true);
    await fetch("/api/stock-adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        productId: adjustProduct.id,
        type: adjustForm.type,
        qty: Number(adjustForm.qty),
        reason: adjustForm.reason,
        note: adjustForm.note,
      }),
    });
    setAdjustLoading(false);
    setShowAdjust(false);
    setAdjustProduct(null);
    notify.success("Stock ajustado correctamente");
    window.location.reload();
  }

  async function handleDeleteProduct() {
    if (!deleteProduct) return;
    setDeleteProductLoading(true);
    const res = await fetch(`/api/products/${deleteProduct.id}`, {
      method: "DELETE",
    });
    setDeleteProductLoading(false);
    if (res.ok) {
      notify.success("Producto eliminado correctamente");
      window.location.reload();
    } else {
      notify.error("Error al eliminar producto");
    }
  }

  async function handleCreateCategory() {
    const name = categoryPromptValue.trim();
    if (!name) return;
    setCategoryPromptLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tenantId }),
    });
    setCategoryPromptLoading(false);
    if (res.ok) {
      notify.success("Categoria creada correctamente");
      window.location.reload();
    } else {
      notify.error("Error al crear categoria");
    }
  }

  async function handleDeleteCategory() {
    if (!deleteCategory) return;
    setDeleteCategoryLoading(true);
    const res = await fetch(`/api/categories/${deleteCategory.id}`, {
      method: "DELETE",
    });
    setDeleteCategoryLoading(false);
    if (res.ok) {
      notify.success("Categoria eliminada correctamente");
      window.location.reload();
    } else {
      notify.error("Error al eliminar categoria");
    }
  }

  function openCategoryPrompt() {
    setCategoryPromptValue("");
    setCategoryPromptOpen(true);
  }

  return (
    <div className="inventory-page">
      <style>{`
        .inventory-page {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .inventory-page button:focus-visible,
        .inventory-page input:focus-visible,
        .inventory-page select:focus-visible,
        .inventory-page a:focus-visible {
          outline: 2px solid var(--cyan-l);
          outline-offset: 3px;
        }

        .inventory-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 22px;
          align-items: center;
          padding: 26px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
        }

        .inventory-eyebrow {
          margin-bottom: 8px;
          color: var(--cyan-l);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .inventory-title {
          margin-bottom: 8px;
          color: var(--text);
          font-family: var(--font-display);
          font-size: 30px;
          line-height: 1.1;
          font-weight: 800;
        }

        .inventory-subtitle {
          max-width: 680px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .inventory-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-danger,
        .btn-ghost,
        .chip {
          border: 1px solid var(--border);
          border-radius: 10px;
          min-height: 38px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: border-color .15s ease, color .15s ease, background .15s ease, transform .15s ease;
        }

        .btn-primary {
          border: 0;
          background: var(--cyan);
          color: var(--bg);
        }

        .btn-primary:hover {
          background: var(--cyan-l);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--text);
        }

        .btn-secondary:hover,
        .btn-ghost:hover,
        .chip:hover {
          border-color: var(--border-h);
          color: var(--cyan-l);
        }

        .btn-danger {
          background: transparent;
          color: var(--danger);
        }

        .btn-ghost {
          background: transparent;
          color: var(--muted);
        }

        .inventory-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .summary-item {
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
        }

        .summary-label {
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .summary-value {
          color: var(--text);
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
        }

        .summary-value.attention {
          color: var(--danger);
        }

        .inventory-workbar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
        }

        .filter-row {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 180px 140px 150px auto;
          gap: 10px;
          align-items: center;
        }

        .quick-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .chip {
          min-height: 32px;
          padding: 6px 10px;
          background: var(--bg2);
          color: var(--muted);
          font-size: 12px;
        }

        .chip.active {
          border-color: var(--cyan);
          background: rgba(14,165,233,0.12);
          color: var(--cyan-l);
        }

        .result-count {
          margin-left: auto;
          color: var(--muted);
          font-size: 13px;
        }

        .inventory-table-card {
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          overflow: hidden;
        }

        .inventory-table-scroll {
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          min-width: 940px;
          border-collapse: collapse;
        }

        .inventory-table th {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .inventory-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
          font-size: 13px;
          vertical-align: middle;
        }

        .inventory-table tr:last-child td {
          border-bottom: 0;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 260px;
        }

        .product-image,
        .product-image-placeholder {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .product-image {
          object-fit: cover;
        }

        .product-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--bg2);
        }

        .product-image-placeholder span {
          width: 14px;
          height: 14px;
          border: 2px solid var(--muted);
          border-radius: 4px;
          opacity: .75;
        }

        .product-name {
          color: var(--text);
          font-size: 14px;
          font-weight: 750;
          line-height: 1.3;
        }

        .product-meta {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .money {
          color: var(--text);
          font-weight: 750;
          white-space: nowrap;
        }

        .stock-stack {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }

        .stock-amount {
          color: var(--text);
          font-weight: 800;
          white-space: nowrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .stock-ok,
        .status-active {
          background: rgba(16,185,129,0.10);
          color: var(--success);
        }

        .stock-low {
          background: rgba(245,158,11,0.12);
          color: var(--warning);
        }

        .stock-zero,
        .status-inactive {
          background: rgba(239,68,68,0.11);
          color: var(--danger);
        }

        .row-actions {
          display: flex;
          gap: 7px;
          align-items: center;
          white-space: nowrap;
        }

        .row-action {
          min-height: 32px;
          padding: 5px 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: transparent;
          color: var(--muted);
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
        }

        .row-action.primary {
          color: var(--cyan-l);
        }

        .row-action.danger {
          color: var(--danger);
        }

        .mobile-products {
          display: none;
        }

        .mobile-product {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 12px;
          padding: 14px;
          border-top: 1px solid var(--border);
        }

        .mobile-product:first-child {
          border-top: 0;
        }

        .mobile-product-main {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .mobile-product-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .mobile-detail-label {
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
        }

        .mobile-detail-value {
          margin-top: 2px;
          color: var(--text);
          font-size: 13px;
          font-weight: 750;
        }

        .mobile-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .empty-state {
          padding: 48px 24px;
          text-align: center;
        }

        .empty-state h3 {
          color: var(--text);
          font-family: var(--font-display);
          font-size: 18px;
          margin-bottom: 8px;
        }

        .empty-state p {
          max-width: 460px;
          margin: 0 auto 18px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .empty-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .inventory-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0,0,0,0.66);
        }

        .inventory-modal {
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
        }

        .inventory-modal-wide {
          max-width: 720px;
        }

        .inventory-modal-medium {
          max-width: 520px;
        }

        .inventory-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          padding: 24px 26px 18px;
          border-bottom: 1px solid var(--border);
        }

        .inventory-modal-header h2 {
          color: var(--text);
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
        }

        .inventory-modal-header p {
          margin-top: 5px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .icon-close {
          width: 34px;
          height: 34px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: 15px;
        }

        .inventory-modal-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 26px 26px;
        }

        .product-form-section {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          gap: 18px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--bg2);
        }

        .product-form-section h3 {
          margin-bottom: 5px;
          color: var(--text);
          font-size: 14px;
          font-weight: 800;
        }

        .product-form-section p {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
        }

        .product-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .product-form-image {
          width: 100%;
          height: 132px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 10px;
          border: 1px solid var(--border);
        }

        .inventory-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 4px;
        }

        .adjust-current {
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--bg2);
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .adjust-options {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        .adjust-option {
          padding: 10px 8px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-size: 12px;
          font-weight: 750;
          text-align: left;
        }

        .adjust-option.active {
          border-color: var(--cyan);
          background: rgba(14,165,233,0.12);
          color: var(--cyan-l);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 11px 13px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg2);
        }

        @media (max-width: 1180px) {
          .inventory-hero {
            grid-template-columns: 1fr;
          }

          .inventory-actions {
            justify-content: flex-start;
          }

          .filter-row {
            grid-template-columns: minmax(240px, 1fr) 1fr 1fr;
          }

          .filter-row .btn-ghost {
            width: fit-content;
          }

          .inventory-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .col-cost {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .inventory-page {
            padding: 20px 16px 28px;
            gap: 18px;
          }

          .inventory-hero {
            padding: 22px;
          }

          .inventory-title {
            font-size: 25px;
          }

          .inventory-actions,
          .inventory-actions button {
            width: 100%;
          }

          .inventory-summary {
            grid-template-columns: 1fr 1fr;
          }

          .filter-row {
            grid-template-columns: 1fr;
          }

          .result-count {
            width: 100%;
            margin-left: 0;
          }

          .inventory-table-scroll {
            display: none;
          }

          .mobile-products {
            display: block;
          }

          .product-form-section {
            grid-template-columns: 1fr;
          }

          .product-form-grid,
          .adjust-options {
            grid-template-columns: 1fr;
          }

          .inventory-modal-header,
          .inventory-modal-body {
            padding-left: 18px;
            padding-right: 18px;
          }

          .inventory-modal-footer {
            flex-direction: column-reverse;
          }
        }
      `}</style>

      <PageHeader
        className="inventory-hero"
        context="Inventario operativo"
        title="Productos"
        description={`${products.length} productos registrados. Encuentra productos, revisa stock y accede rapido a edicion, importacion o ajustes.`}
        actions={
          <div className="inventory-actions">
          <Button type="button" onClick={() => setShowImport(true)} variant="secondary">
            Importar CSV
          </Button>
          <Button
            type="button"
            onClick={() =>
              window.open(`/api/products/export?tenantId=${tenantId}`, "_blank")
            }
            variant="secondary"
          >
            Exportar Excel
          </Button>
          <Button type="button" onClick={() => setShowForm(true)} variant="primary">
            Nuevo producto
          </Button>
          </div>
        }
      />

      <section className="inventory-summary" aria-label="Resumen de inventario">
        <div className="summary-item">
          <p className="summary-label">Total productos</p>
          <p className="summary-value">{products.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Stock bajo</p>
          <p className={`summary-value ${lowStockCount > 0 ? "attention" : ""}`}>{lowStockCount}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Sin stock</p>
          <p className={`summary-value ${zeroStockCount > 0 ? "attention" : ""}`}>{zeroStockCount}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Inactivos</p>
          <p className={`summary-value ${inactiveCount > 0 ? "attention" : ""}`}>{inactiveCount}</p>
        </div>
      </section>

      <section className="inventory-workbar" aria-label="Busqueda y filtros">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={inputStyle}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas las categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={inputStyle}
            aria-label="Filtrar por estado"
          >
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="all">Todos</option>
          </select>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            style={inputStyle}
            aria-label="Filtrar por stock"
          >
            <option value="all">Todo el stock</option>
            <option value="low">Stock bajo</option>
            <option value="zero">Sin stock</option>
          </select>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="btn-ghost">
              Limpiar
            </button>
          )}
        </div>

        <div className="quick-filters">
          <button
            type="button"
            onClick={() => setFilterStock(filterStock === "low" ? "all" : "low")}
            className={`chip ${filterStock === "low" ? "active" : ""}`}
          >
            Stock bajo
          </button>
          <button
            type="button"
            onClick={() => setFilterStock(filterStock === "zero" ? "all" : "zero")}
            className={`chip ${filterStock === "zero" ? "active" : ""}`}
          >
            Sin stock
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === "inactive" ? "active" : "inactive")}
            className={`chip ${filterStatus === "inactive" ? "active" : ""}`}
          >
            Inactivos
          </button>
          <button
            type="button"
            onClick={openCategoryPrompt}
            className="chip"
          >
            Nueva categoria
          </button>
          <button type="button" onClick={() => setShowCategories(true)} className="chip">
            Ver categorias ({categories.length})
          </button>
          <span className="result-count">
            {filtered.length} de {products.length} productos
          </span>
        </div>
      </section>

      <Surface as="section" className="inventory-table-card" aria-label="Listado de productos">
        {filtered.length === 0 ? (
          <div>
            {products.length === 0 ? (
              <EmptyState
                title="Aun no hay productos"
                description="Agrega tu primer producto o importa un archivo CSV para comenzar a usar inventario y punto de venta."
                actions={
                  <>
                  <Button type="button" onClick={() => setShowForm(true)} variant="primary">
                    Nuevo producto
                  </Button>
                  <Button type="button" onClick={() => setShowImport(true)} variant="secondary">
                    Importar CSV
                  </Button>
                  </>
                }
              />
            ) : (
              <EmptyState
                title="No hay coincidencias"
                description="Ajusta la busqueda o limpia los filtros para volver a ver el inventario disponible."
                actions={
                <Button type="button" onClick={clearFilters} variant="secondary">
                  Limpiar filtros
                </Button>
                }
              />
            )}
          </div>
        ) : (
          <>
            <div className="inventory-table-scroll">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th className="col-cost">Costo</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const stockState = getStockState(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="product-cell">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="product-image" />
                            ) : (
                              <ProductPlaceholder />
                            )}
                            <div>
                              <p className="product-name">{p.name}</p>
                              <p className="product-meta">{p.barcode ? `Codigo: ${p.barcode}` : "Sin codigo de barras"}</p>
                            </div>
                          </div>
                        </td>
                        <td>{p.sku ?? "-"}</td>
                        <td>{categoryName(p.categoryId)}</td>
                        <td><span className="money">${Number(p.price).toLocaleString("es-CL")}</span></td>
                        <td className="col-cost">{p.cost ? `$${Number(p.cost).toLocaleString("es-CL")}` : "-"}</td>
                        <td>
                          <div className="stock-stack">
                            <span className="stock-amount">{Number(p.stock)} {p.unit}</span>
                            <Badge className={stockState.className} variant="neutral">{stockState.label}</Badge>
                          </div>
                        </td>
                        <td>
                          <Badge className={p.active ? "status-active" : "status-inactive"} variant="neutral">
                            {p.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setEditProduct(p);
                                setEditForm({
                                  name: p.name,
                                  sku: p.sku ?? "",
                                  price: p.price,
                                  cost: p.cost ?? "",
                                  stock: p.stock,
                                  minStock: p.minStock ?? "0",
                                  unit: p.unit,
                                  barcode: p.barcode ?? "",
                                  categoryId: p.categoryId ?? "",
                                  imageUrl: p.imageUrl ?? "",
                                });
                              }}
                              className="row-action"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdjustProduct(p);
                                setAdjustForm({
                                  type: "add",
                                  qty: "",
                                  reason: "",
                                  note: "",
                                });
                                setShowAdjust(true);
                              }}
                              className="row-action primary"
                            >
                              Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteProduct(p)}
                              className="row-action danger"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mobile-products">
              {filtered.map((p) => {
                const stockState = getStockState(p);
                return (
                  <article key={p.id} className="mobile-product">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="product-image" />
                    ) : (
                      <ProductPlaceholder />
                    )}
                    <div>
                      <div className="mobile-product-main">
                        <div>
                          <p className="product-name">{p.name}</p>
                          <p className="product-meta">{p.sku ? `SKU ${p.sku}` : categoryName(p.categoryId)}</p>
                        </div>
                        <Badge className={p.active ? "status-active" : "status-inactive"} variant="neutral">
                          {p.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="mobile-product-details">
                        <div>
                          <p className="mobile-detail-label">Precio</p>
                          <p className="mobile-detail-value">${Number(p.price).toLocaleString("es-CL")}</p>
                        </div>
                        <div>
                          <p className="mobile-detail-label">Stock</p>
                          <p className="mobile-detail-value">{Number(p.stock)} {p.unit}</p>
                        </div>
                      </div>
                      <div className="mobile-actions">
                        <Badge className={stockState.className} variant="neutral">{stockState.label}</Badge>
                        <button
                          type="button"
                          onClick={() => {
                            setEditProduct(p);
                            setEditForm({
                              name: p.name,
                              sku: p.sku ?? "",
                              price: p.price,
                              cost: p.cost ?? "",
                              stock: p.stock,
                              minStock: p.minStock ?? "0",
                              unit: p.unit,
                              barcode: p.barcode ?? "",
                              categoryId: p.categoryId ?? "",
                              imageUrl: p.imageUrl ?? "",
                            });
                          }}
                          className="row-action"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustProduct(p);
                            setAdjustForm({
                              type: "add",
                              qty: "",
                              reason: "",
                              note: "",
                            });
                            setShowAdjust(true);
                          }}
                          className="row-action primary"
                        >
                          Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteProduct(p)}
                          className="row-action danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </Surface>

      {showForm && (
        <Modal
          title="Nuevo producto"
          subtitle="Completa la informacion necesaria para venta, inventario y busqueda."
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          data={form}
          onChange={setForm}
          categories={categories}
          submitLabel="Guardar producto"
          isLoading={loading}
          isImageUploading={{ value: imageUploading, onChange: setImageUploading }}
        />
      )}

      {editProduct && editForm && (
        <Modal
          title="Editar producto"
          subtitle="Actualiza los datos visibles y operativos del producto."
          onSubmit={handleEdit}
          onClose={() => setEditProduct(null)}
          data={editForm}
          onChange={setEditForm}
          categories={categories}
          submitLabel="Guardar cambios"
          isLoading={editLoading}
          isImageUploading={{ value: editImageUploading, onChange: setEditImageUploading }}
        />
      )}

      {showImport && (
        <div className="inventory-modal-backdrop">
          <div className="inventory-modal inventory-modal-wide">
            <div className="inventory-modal-header">
              <div>
                <h2>Importar productos desde CSV</h2>
                <p>Sube un archivo para cargar productos al inventario actual.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="icon-close"
                aria-label="Cerrar importacion"
              >
                x
              </button>
            </div>
            <div className="inventory-modal-body">
              <ImportProducts
                tenantId={tenantId}
                onDone={() => {
                  notify.success("Importacion finalizada");
                  setShowImport(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showAdjust && adjustProduct && (
        <div className="inventory-modal-backdrop">
          <div className="inventory-modal inventory-modal-medium">
            <div className="inventory-modal-header">
              <div>
                <h2>Ajustar stock</h2>
                <p>Registra un movimiento para corregir el stock disponible.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdjust(false);
                  setAdjustProduct(null);
                }}
                className="icon-close"
                aria-label="Cerrar ajuste de stock"
              >
                x
              </button>
            </div>
            <form onSubmit={handleAdjust} className="inventory-modal-body">
              <div className="adjust-current">
                Producto: <strong style={{ color: "var(--text)" }}>{adjustProduct.name}</strong>
                <br />
                Stock actual: <strong style={{ color: "var(--text)" }}>{Number(adjustProduct.stock)} {adjustProduct.unit}</strong>
              </div>

              <div>
                <label style={labelStyle}>Tipo de ajuste *</label>
                <div className="adjust-options">
                  {[
                    { value: "add", label: "Agregar", desc: "Suma al stock" },
                    { value: "subtract", label: "Restar", desc: "Resta del stock" },
                    { value: "set", label: "Fijar", desc: "Stock exacto" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setAdjustForm({ ...adjustForm, type: t.value })
                      }
                      className={`adjust-option ${adjustForm.type === t.value ? "active" : ""}`}
                    >
                      <strong>{t.label}</strong>
                      <br />
                      <span>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  {adjustForm.type === "set" ? "Stock nuevo *" : "Cantidad *"}
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0"
                  style={inputStyle}
                  value={adjustForm.qty}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, qty: e.target.value })
                  }
                  placeholder={adjustForm.type === "set" ? "Ej: 50" : "Ej: 10"}
                />
                {adjustForm.qty && (
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                    Stock resultante:{" "}
                    <strong style={{ color: "var(--success)" }}>
                      {adjustForm.type === "add"
                        ? Number(adjustProduct.stock) + Number(adjustForm.qty)
                        : adjustForm.type === "subtract"
                          ? Math.max(0, Number(adjustProduct.stock) - Number(adjustForm.qty))
                          : Number(adjustForm.qty)}{" "}
                      {adjustProduct.unit}
                    </strong>
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Motivo *</label>
                <select
                  required
                  style={inputStyle}
                  value={adjustForm.reason}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, reason: e.target.value })
                  }
                >
                  <option value="">Seleccionar motivo...</option>
                  <option value="conteo_fisico">Conteo fisico</option>
                  <option value="merma">Merma o perdida</option>
                  <option value="vencimiento">Producto vencido</option>
                  <option value="robo">Robo o extravio</option>
                  <option value="devolucion">Devolucion de cliente</option>
                  <option value="error_ingreso">Correccion de error</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Nota (opcional)</label>
                <input
                  style={inputStyle}
                  value={adjustForm.note}
                  placeholder="Detalle adicional..."
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, note: e.target.value })
                  }
                />
              </div>

              <div className="inventory-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjust(false);
                    setAdjustProduct(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <Button type="submit" isLoading={adjustLoading} loadingText="Guardando" variant="primary">
                  Confirmar ajuste
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategories && (
        <div className="inventory-modal-backdrop">
          <div className="inventory-modal inventory-modal-medium">
            <div className="inventory-modal-header">
              <div>
                <h2>Categorias ({categories.length})</h2>
                <p>Gestion rapida de categorias usadas por productos.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategories(false)}
                className="icon-close"
                aria-label="Cerrar categorias"
              >
                x
              </button>
            </div>
            <div className="inventory-modal-body">
              <div className="category-list">
                {categories.length === 0 ? (
                  <div className="empty-state" style={{ padding: 24 }}>
                    <h3>No hay categorias</h3>
                    <p>Crea la primera categoria para ordenar mejor tus productos.</p>
                  </div>
                ) : (
                  categories.map((cat: any) => (
                    <div key={cat.id} className="category-item">
                      <span style={{ color: "var(--text)", fontWeight: 750 }}>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => setDeleteCategory(cat)}
                        className="row-action danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={openCategoryPrompt}
                className="btn-primary"
              >
                Nueva categoria
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteProduct)}
        title="Eliminar producto"
        description={`Vas a eliminar "${deleteProduct?.name ?? "este producto"}". Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar producto"
        variant="danger"
        loading={deleteProductLoading}
        onCancel={() => {
          if (deleteProductLoading) return;
          setDeleteProduct(null);
        }}
        onConfirm={handleDeleteProduct}
      />

      <ConfirmDialog
        open={Boolean(deleteCategory)}
        title="Eliminar categoria"
        description={`Vas a eliminar "${deleteCategory?.name ?? "esta categoria"}". Los productos asociados pueden quedar sin categoria.`}
        confirmLabel="Eliminar categoria"
        variant="danger"
        loading={deleteCategoryLoading}
        onCancel={() => {
          if (deleteCategoryLoading) return;
          setDeleteCategory(null);
        }}
        onConfirm={handleDeleteCategory}
      />

      <PromptDialog
        open={categoryPromptOpen}
        title="Nueva categoria"
        description="Crea una categoria para ordenar productos en inventario y punto de venta."
        label="Nombre de la categoria"
        placeholder="Ej: Bebidas"
        value={categoryPromptValue}
        onChange={setCategoryPromptValue}
        confirmLabel="Crear categoria"
        loading={categoryPromptLoading}
        validate={(value) => value.trim().length === 0 ? "Ingresa un nombre para la categoria." : null}
        onCancel={() => {
          if (categoryPromptLoading) return;
          setCategoryPromptOpen(false);
          setCategoryPromptValue("");
        }}
        onConfirm={handleCreateCategory}
      />
    </div>
  );
}

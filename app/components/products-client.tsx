/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import ImageUpload from "./image-upload";
import ImportProducts from "./import-products";

const inputStyle: any = {
  padding: "10px 14px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 8,
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
};

function FormFields({
  data,
  onChange,
  categories,
}: {
  data: any;
  onChange: (d: any) => void;
  categories: any[];
}) {
  return (
    <>
      <div style={{ marginBottom: 4 }}>
        <label style={labelStyle}>Imagen del producto</label>
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt="producto"
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 8,
            }}
          />
        )}
        <ImageUpload onUpload={(url) => onChange({ ...data, imageUrl: url })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
          <label style={labelStyle}>Stock mínimo</label>
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
        <div>
          <label style={labelStyle}>Categoría</label>
          <select
            style={inputStyle}
            value={data.categoryId}
            onChange={(e) => onChange({ ...data, categoryId: e.target.value })}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Código de barras</label>
          <input
            style={inputStyle}
            value={data.barcode}
            onChange={(e) => onChange({ ...data, barcode: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

function Modal({
  title,
  onSubmit,
  onClose,
  data,
  onChange,
  categories,
  submitLabel,
  isLoading,
}: any) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "32px",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 24,
          }}
        >
          {title}
        </h2>
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <FormFields data={data} onChange={onChange} categories={categories} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--muted)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "11px",
                background: "var(--cyan)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isLoading ? "Guardando..." : submitLabel}
            </button>
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
  const [showCategories, setShowCategories] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);
  const [adjustLoading, setAdjustLoading] = useState(false);
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

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tenantId }),
    });
    setLoading(false);
    setShowForm(false);
    window.location.reload();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    await fetch(`/api/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditLoading(false);
    setEditProduct(null);
    window.location.reload();
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
    window.location.reload();
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 300 }}
        />
        <button
          onClick={() => {
            const name = prompt("Nombre de la categoría:");
            if (!name) return;
            fetch("/api/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, tenantId }),
            }).then(() => window.location.reload());
          }}
          style={{
            padding: "10px 16px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--muted)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          + Categoría
        </button>
        <button
          onClick={() => setShowCategories(true)}
          style={{
            padding: "10px 16px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--muted)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Ver categorías ({categories.length})
        </button>
        <button
          onClick={() => setShowImport(true)}
          style={{
            padding: "10px 16px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--muted)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ⬆️ Importar CSV
        </button>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "10px 20px",
            background: "var(--cyan)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "Imagen",
                "Nombre",
                "SKU",
                "Precio",
                "Costo",
                "Stock",
                "Estado",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "48px",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                  }}
                >
                  {products.length === 0
                    ? "Aún no hay productos. Agrega el primero."
                    : "No se encontraron productos."}
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <td style={{ padding: "10px 16px" }}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          background: "var(--bg2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        📦
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 14,
                      color: "var(--text)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "var(--muted)",
                    }}
                  >
                    {p.sku ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 14,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${Number(p.price).toLocaleString("es-CL")}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.cost
                      ? `$${Number(p.cost).toLocaleString("es-CL")}`
                      : "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        color:
                          Number(p.stock) <= Number(p.minStock) &&
                          Number(p.minStock) > 0
                            ? "var(--danger)"
                            : "var(--success)",
                      }}
                    >
                      {Number(p.stock)} {p.unit}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: p.active
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: p.active ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
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
                        style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          color: "var(--muted)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Editar
                      </button>
                      <button
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
                        style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          color: "var(--cyan)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Stock
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              `¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`,
                            )
                          )
                            return;
                          await fetch(`/api/products/${p.id}`, {
                            method: "DELETE",
                          });
                          window.location.reload();
                        }}
                        style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          color: "var(--danger)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo producto */}
      {showForm && (
        <Modal
          title="Nuevo producto"
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          data={form}
          onChange={setForm}
          categories={categories}
          submitLabel="Guardar producto"
          isLoading={loading}
        />
      )}

      {/* Modal editar producto */}
      {editProduct && editForm && (
        <Modal
          title="Editar producto"
          onSubmit={handleEdit}
          onClose={() => setEditProduct(null)}
          data={editForm}
          onChange={setEditForm}
          categories={categories}
          submitLabel="Guardar cambios"
          isLoading={editLoading}
        />
      )}

      {/* Modal importar CSV */}
      {showImport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px",
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                Importar productos desde CSV
              </h2>
              <button
                onClick={() => setShowImport(false)}
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
            <ImportProducts
              tenantId={tenantId}
              onDone={() => {
                setShowImport(false);
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}

      {/* Modal ajuste de stock */}
      {showAdjust && adjustProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px",
              width: "100%",
              maxWidth: 440,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 6,
              }}
            >
              Ajustar stock
            </h2>
            <p
              style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}
            >
              {adjustProduct.name} — Stock actual:{" "}
              <strong style={{ color: "var(--text)" }}>
                {Number(adjustProduct.stock)} {adjustProduct.unit}
              </strong>
            </p>
            <form
              onSubmit={handleAdjust}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={labelStyle}>Tipo de ajuste *</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      value: "add",
                      label: "➕ Agregar",
                      desc: "Suma al stock",
                    },
                    {
                      value: "subtract",
                      label: "➖ Restar",
                      desc: "Resta del stock",
                    },
                    { value: "set", label: "🎯 Fijar", desc: "Stock exacto" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setAdjustForm({ ...adjustForm, type: t.value })
                      }
                      style={{
                        padding: "10px 8px",
                        borderRadius: 8,
                        border: `1px solid ${adjustForm.type === t.value ? "var(--cyan)" : "var(--border)"}`,
                        background:
                          adjustForm.type === t.value
                            ? "rgba(14,165,233,0.1)"
                            : "transparent",
                        color:
                          adjustForm.type === t.value
                            ? "var(--cyan)"
                            : "var(--muted)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>{t.label}</span>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>
                        {t.desc}
                      </span>
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
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 6,
                    }}
                  >
                    Stock resultante:{" "}
                    <strong style={{ color: "var(--success)" }}>
                      {adjustForm.type === "add"
                        ? Number(adjustProduct.stock) + Number(adjustForm.qty)
                        : adjustForm.type === "subtract"
                          ? Math.max(
                              0,
                              Number(adjustProduct.stock) -
                                Number(adjustForm.qty),
                            )
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
                  <option value="conteo_fisico">Conteo físico</option>
                  <option value="merma">Merma o pérdida</option>
                  <option value="vencimiento">Producto vencido</option>
                  <option value="robo">Robo o extravío</option>
                  <option value="devolucion">Devolución de cliente</option>
                  <option value="error_ingreso">Corrección de error</option>
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

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjust(false);
                    setAdjustProduct(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--muted)",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "var(--cyan)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {adjustLoading ? "Guardando..." : "Confirmar ajuste"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCategories && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "28px",
              width: "100%",
              maxWidth: 400,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                Categorías ({categories.length})
              </h2>
              <button
                onClick={() => setShowCategories(false)}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.length === 0 ? (
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--muted)",
                    textAlign: "center",
                    padding: "24px",
                  }}
                >
                  No hay categorías creadas aún.
                </p>
              ) : (
                categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--bg2)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      {cat.name}
                    </span>
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Eliminar categoría "${cat.name}"?`))
                          return;
                        await fetch(`/api/categories/${cat.id}`, {
                          method: "DELETE",
                        });
                        window.location.reload();
                      }}
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        color: "var(--danger)",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => {
                const name = prompt("Nombre de la categoría:");
                if (!name) return;
                fetch("/api/categories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, tenantId }),
                }).then(() => window.location.reload());
              }}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "10px",
                background: "var(--cyan)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Nueva categoría
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

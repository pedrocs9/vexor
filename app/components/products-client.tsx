/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import ImageUpload from './image-upload'

const inputStyle: any = {
  padding: '10px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text)',
  fontSize: 14, outline: 'none', width: '100%',
}

const labelStyle: any = {
  fontSize: 12, color: 'var(--muted)',
  display: 'block', marginBottom: 6,
}

function FormFields({ data, onChange, categories }: {
  data: any, onChange: (d: any) => void, categories: any[]
}) {
  return (
    <>
      <div style={{ marginBottom: 4 }}>
        <label style={labelStyle}>Imagen del producto</label>
        {data.imageUrl && (
          <img src={data.imageUrl} alt="producto" style={{
            width: '100%', height: 120,
            objectFit: 'cover', borderRadius: 8, marginBottom: 8,
          }} />
        )}
        <ImageUpload onUpload={url => onChange({ ...data, imageUrl: url })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input required style={inputStyle} value={data.name}
            onChange={e => onChange({ ...data, name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>SKU</label>
          <input style={inputStyle} value={data.sku}
            onChange={e => onChange({ ...data, sku: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Precio venta *</label>
          <input required type="number" style={inputStyle} value={data.price}
            onChange={e => onChange({ ...data, price: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Costo</label>
          <input type="number" style={inputStyle} value={data.cost}
            onChange={e => onChange({ ...data, cost: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Stock actual *</label>
          <input required type="number" style={inputStyle} value={data.stock}
            onChange={e => onChange({ ...data, stock: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Stock mínimo</label>
          <input type="number" style={inputStyle} value={data.minStock}
            onChange={e => onChange({ ...data, minStock: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Unidad</label>
          <select style={inputStyle} value={data.unit}
            onChange={e => onChange({ ...data, unit: e.target.value })}>
            <option value="un">Unidad</option>
            <option value="kg">Kilogramo</option>
            <option value="lt">Litro</option>
            <option value="caja">Caja</option>
            <option value="saco">Saco</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Categoría</label>
          <select style={inputStyle} value={data.categoryId}
            onChange={e => onChange({ ...data, categoryId: e.target.value })}>
            <option value="">Sin categoría</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Código de barras</label>
          <input style={inputStyle} value={data.barcode}
            onChange={e => onChange({ ...data, barcode: e.target.value })} />
        </div>
      </div>
    </>
  )
}

function Modal({ title, onSubmit, onClose, data, onChange, categories, submitLabel, isLoading }: any) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '32px',
        width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20, fontWeight: 700,
          color: 'var(--text)', marginBottom: 24,
        }}>
          {title}
        </h2>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormFields data={data} onChange={onChange} categories={categories} />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--muted)',
              fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} style={{
              flex: 1, padding: '11px',
              background: 'var(--cyan)', color: 'var(--bg)',
              border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {isLoading ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductsClient({ products, categories, tenantId }: {
  products:   any[]
  categories: any[]
  tenantId:   number
}) {
  const [search, setSearch]           = useState('')
  const [showForm, setShowForm]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [editForm, setEditForm]       = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', sku: '', price: '', cost: '',
    stock: '', minStock: '', unit: 'un',
    categoryId: '', barcode: '', imageUrl: '',
  })

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tenantId }),
    })
    setLoading(false)
    setShowForm(false)
    window.location.reload()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true)
    await fetch(`/api/products/${editProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditLoading(false)
    setEditProduct(null)
    window.location.reload()
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320 }}
        />
        <button
          onClick={() => {
            const name = prompt('Nombre de la categoría:')
            if (!name) return
            fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, tenantId }),
            }).then(() => window.location.reload())
          }}
          style={{
            padding: '10px 16px', background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--muted)',
            fontSize: 14, cursor: 'pointer',
          }}
        >
          + Categoría
        </button>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px', background: 'var(--cyan)',
            color: 'var(--bg)', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Imagen', 'Nombre', 'SKU', 'Precio', 'Costo', 'Stock', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--muted)', textTransform: 'uppercase',
                  letterSpacing: '.06em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  {products.length === 0
                    ? 'Aún no hay productos. Agrega el primero.'
                    : 'No se encontraron productos.'}
                </td>
              </tr>
            ) : filtered.map((p, i) => (
              <tr key={p.id} style={{
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px 16px' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{
                      width: 40, height: 40,
                      objectFit: 'cover', borderRadius: 6,
                    }} />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: 6,
                      background: 'var(--bg2)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 18,
                    }}>📦</div>
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                  {p.name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {p.sku ?? '—'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                  ${Number(p.price).toLocaleString('es-CL')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {p.cost ? `$${Number(p.cost).toLocaleString('es-CL')}` : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0
                      ? 'var(--danger)' : 'var(--success)',
                  }}>
                    {Number(p.stock)} {p.unit}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 100,
                    background: p.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: p.active ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => {
                      setEditProduct(p)
                      setEditForm({
                        name:       p.name,
                        sku:        p.sku ?? '',
                        price:      p.price,
                        cost:       p.cost ?? '',
                        stock:      p.stock,
                        minStock:   p.minStock ?? '0',
                        unit:       p.unit,
                        barcode:    p.barcode ?? '',
                        categoryId: p.categoryId ?? '',
                        imageUrl:   p.imageUrl ?? '',
                      })
                    }}
                    style={{
                      fontSize: 12, padding: '4px 12px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 6, color: 'var(--muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  )
}
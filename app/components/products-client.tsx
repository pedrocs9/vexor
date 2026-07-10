/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

export default function ProductsClient({ products, categories, tenantId }: {
  products: any[]
  categories: any[]
  tenantId: number
}) {
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm] = useState({
    name: '', sku: '', price: '', cost: '',
    stock: '', minStock: '', unit: 'un',
    categoryId: '', barcode: '',
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

  const inputStyle = {
    padding: '10px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)',
    fontSize: 14, outline: 'none', width: '100%',
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20,
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320 }}
        />
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            background: 'var(--cyan)', color: 'var(--bg)',
            border: 'none', borderRadius: 8,
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
              {['Nombre', 'SKU', 'Precio', 'Costo', 'Stock', 'Unidad', 'Estado'].map(h => (
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
                <td colSpan={7} style={{
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
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {p.unit}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo producto */}
      {showForm && (
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
              Nuevo producto
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Nombre *
                  </label>
                  <input required style={inputStyle} value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    SKU
                  </label>
                  <input style={inputStyle} value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Precio venta *
                  </label>
                  <input required type="number" style={inputStyle} value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Costo
                  </label>
                  <input type="number" style={inputStyle} value={form.cost}
                    onChange={e => setForm({ ...form, cost: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Stock actual *
                  </label>
                  <input required type="number" style={inputStyle} value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Stock mínimo
                  </label>
                  <input type="number" style={inputStyle} value={form.minStock}
                    onChange={e => setForm({ ...form, minStock: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Unidad
                  </label>
                  <select style={inputStyle} value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="un">Unidad</option>
                    <option value="kg">Kilogramo</option>
                    <option value="lt">Litro</option>
                    <option value="caja">Caja</option>
                    <option value="saco">Saco</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Código de barras
                  </label>
                  <input style={inputStyle} value={form.barcode}
                    onChange={e => setForm({ ...form, barcode: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '11px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--muted)',
                    fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '11px',
                    background: 'var(--cyan)', color: 'var(--bg)',
                    border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
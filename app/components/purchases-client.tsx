/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

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

type InvoiceItem = {
  productId:   number | null
  productName: string
  qty:         number
  cost:        number
  subtotal:    number
}

export default function PurchasesClient({ invoices, suppliers, products, tenantId }: {
  invoices:  any[]
  suppliers: any[]
  products:  any[]
  tenantId:  number
}) {
  const [showForm, setShowForm]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [form, setForm] = useState({
    supplierId: '', invoiceNumber: '', date: '', note: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([{
    productId: null, productName: '', qty: 1, cost: 0, subtotal: 0,
  }])
  const [productSearch, setProductSearch] = useState<string[]>([''])
  const [showProductList, setShowProductList] = useState<boolean[]>([false])

  const total = items.reduce((s, i) => s + i.subtotal, 0)

  function addItem() {
    setItems([...items, { productId: null, productName: '', qty: 1, cost: 0, subtotal: 0 }])
    setProductSearch([...productSearch, ''])
    setShowProductList([...showProductList, false])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
    setProductSearch(productSearch.filter((_, i) => i !== index))
    setShowProductList(showProductList.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      const newItem = { ...item, [field]: value }
      if (field === 'qty' || field === 'cost') {
        newItem.subtotal = Number(newItem.qty) * Number(newItem.cost)
      }
      return newItem
    })
    setItems(updated)
  }

  function selectProduct(index: number, product: any) {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      return {
        ...item,
        productId:   product.id,
        productName: product.name,
        cost:        Number(product.cost ?? 0),
        subtotal:    Number(item.qty) * Number(product.cost ?? 0),
      }
    })
    setItems(updated)
    const newSearch = [...productSearch]
    newSearch[index] = product.name
    setProductSearch(newSearch)
    const newShow = [...showProductList]
    newShow[index] = false
    setShowProductList(newShow)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.some(i => !i.productName || !i.qty || !i.cost)) return
    setLoading(true)
    await fetch('/api/purchase-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tenantId, items }),
    })
    setLoading(false)
    setShowForm(false)
    setForm({ supplierId: '', invoiceNumber: '', date: '', note: '' })
    setItems([{ productId: null, productName: '', qty: 1, cost: 0, subtotal: 0 }])
    setProductSearch([''])
    setShowProductList([false])
    window.location.reload()
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Facturas registradas', value: String(invoices.length),                                                                   color: 'var(--cyan)' },
          { label: 'Total comprado',        value: `$${invoices.reduce((s, i) => s + Number(i.total), 0).toLocaleString('es-CL')}`,           color: 'var(--warning)' },
          { label: 'Este mes',              value: `$${invoices.filter(i => new Date(i.date).getMonth() === new Date().getMonth()).reduce((s, i) => s + Number(i.total), 0).toLocaleString('es-CL')}`, color: 'var(--success)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', marginBottom: 20 }}>
        <button onClick={() => setShowForm(true)} style={{
          marginLeft: 'auto', padding: '10px 20px',
          background: 'var(--cyan)', color: 'var(--bg)',
          border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          + Nueva factura de compra
        </button>
      </div>

      {/* Tabla facturas */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['N° Factura', 'Proveedor', 'Fecha', 'Items', 'Total', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Aún no hay facturas registradas.</td></tr>
            ) : invoices.map((inv, i) => {
              const supplier = suppliers.find(s => s.id === inv.supplierId)
              return (
                <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                    {inv.invoiceNumber ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {supplier?.name ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(inv.date).toLocaleDateString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {inv.items?.length ?? 0} productos
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>
                    ${Number(inv.total).toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      style={{ fontSize: 12, padding: '4px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal nueva factura */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
              Nueva factura de compra
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Datos factura */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Proveedor</label>
                  <select style={inputStyle} value={form.supplierId}
                    onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                    <option value="">Sin proveedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>N° Factura</label>
                  <input style={inputStyle} value={form.invoiceNumber}
                    placeholder="Ej: 001234"
                    onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input type="date" style={inputStyle} value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Nota</label>
                  <input style={inputStyle} value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Productos *</label>
                  <button type="button" onClick={addItem} style={{
                    padding: '4px 12px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: 6,
                    color: 'var(--cyan)', fontSize: 13, cursor: 'pointer',
                  }}>
                    + Agregar item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((item, index) => (
                    <div key={index} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>

                        {/* Producto con búsqueda */}
                        <div style={{ position: 'relative' }}>
                          <label style={labelStyle}>Producto</label>
                          <input
                            style={inputStyle}
                            placeholder="Buscar producto..."
                            value={productSearch[index]}
                            onChange={e => {
                              const newSearch = [...productSearch]
                              newSearch[index] = e.target.value
                              setProductSearch(newSearch)
                              const newShow = [...showProductList]
                              newShow[index] = true
                              setShowProductList(newShow)
                              updateItem(index, 'productName', e.target.value)
                            }}
                          />
                          {showProductList[index] && productSearch[index] && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 50, maxHeight: 160, overflowY: 'auto', marginTop: 4 }}>
                              {products
                                .filter(p => p.name.toLowerCase().includes(productSearch[index].toLowerCase()))
                                .slice(0, 6)
                                .map(p => (
                                  <button key={p.id} type="button"
                                    onClick={() => selectProduct(index, p)}
                                    style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                                    {p.name}
                                    <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 11 }}>
                                      Stock: {Number(p.stock)}
                                    </span>
                                  </button>
                                ))
                              }
                              {productSearch[index] && !products.find(p => p.name.toLowerCase() === productSearch[index].toLowerCase()) && (
                                <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--muted)' }}>
                                  Se registrará como producto nuevo
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={labelStyle}>Cantidad</label>
                          <input type="number" step="0.1" min="0.1" style={inputStyle}
                            value={item.qty}
                            onChange={e => updateItem(index, 'qty', Number(e.target.value))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Costo unit.</label>
                          <input type="number" style={inputStyle}
                            value={item.cost}
                            onChange={e => updateItem(index, 'cost', Number(e.target.value))} />
                        </div>
                        <div>
                          <label style={labelStyle}>Subtotal</label>
                          <div style={{ ...inputStyle, background: 'var(--surface)', color: 'var(--muted)' }}>
                            ${item.subtotal.toLocaleString('es-CL')}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeItem(index)}
                          style={{ padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, padding: '12px 16px', background: 'var(--bg2)', borderRadius: 10 }}>
                  <span style={{ fontSize: 14, color: 'var(--muted)', marginRight: 16 }}>Total factura</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>
                    ${total.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Guardando...' : 'Registrar factura y actualizar stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle factura */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Factura {selectedInvoice.invoiceNumber ?? `#${selectedInvoice.id}`}
              </h2>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, padding: '12px 16px', background: 'var(--bg2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Proveedor</span>
                <span style={{ color: 'var(--text)' }}>{suppliers.find(s => s.id === selectedInvoice.supplierId)?.name ?? '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Fecha</span>
                <span style={{ color: 'var(--text)' }}>{new Date(selectedInvoice.date).toLocaleDateString('es-CL')}</span>
              </div>
              {selectedInvoice.note && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>Nota</span>
                  <span style={{ color: 'var(--text)' }}>{selectedInvoice.note}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {selectedInvoice.items?.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.productName}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{Number(item.qty)} × ${Number(item.cost).toLocaleString('es-CL')}</p>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>${Number(item.subtotal).toLocaleString('es-CL')}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg2)', borderRadius: 10 }}>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--warning)' }}>${Number(selectedInvoice.total).toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
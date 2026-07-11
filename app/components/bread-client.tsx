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

export default function BreadClient({ orders, suppliers, tenantId }: {
  orders:    any[]
  suppliers: any[]
  tenantId:  number
}) {
  const [showOrder, setShowOrder]   = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [loading, setLoading]       = useState(false)

  const [orderForm, setOrderForm] = useState({
    supplierId: '', kgOrdered: '', pricePerKg: '',
  })

  const [returnForm, setReturnForm] = useState({
    kgReturned: '', kgSold: '', kgLost: '0', amountCredited: '',
  })

  const todayOrders = orders.filter(o => {
    const date = new Date(o.date)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  })

  const totalKgToday  = todayOrders.reduce((s, o) => s + Number(o.kgOrdered), 0)
  const totalCostToday = todayOrders.reduce((s, o) => s + Number(o.totalCost), 0)

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/bread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'order', tenantId, ...orderForm }),
    })
    setLoading(false)
    setShowOrder(false)
    setOrderForm({ supplierId: '', kgOrdered: '', pricePerKg: '' })
    window.location.reload()
  }

  async function handleReturn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/bread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'return',
        orderId: selectedOrder.id,
        ...returnForm,
      }),
    })
    setLoading(false)
    setShowReturn(false)
    setSelectedOrder(null)
    setReturnForm({ kgReturned: '', kgSold: '', kgLost: '0', amountCredited: '' })
    window.location.reload()
  }

  return (
    <div>
      {/* Stats del día */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Pedidos hoy',    value: `${todayOrders.length}`,              color: 'var(--cyan)' },
          { label: 'Kg comprados',   value: `${totalKgToday.toFixed(1)} kg`,      color: 'var(--warning)' },
          { label: 'Costo del día',  value: `$${totalCostToday.toLocaleString('es-CL')}`, color: 'var(--danger)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 700, color: s.color,
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setShowOrder(true)}
          style={{
            padding: '10px 20px', background: 'var(--cyan)',
            color: 'var(--bg)', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Registrar compra de pan
        </button>
      </div>

      {/* Tabla de pedidos */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600, color: 'var(--text)',
          }}>
            Historial de pedidos
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Fecha', 'Proveedor', 'Kg comprados', 'Precio/Kg', 'Total', 'Kg devueltos', 'Kg vendidos', 'Acciones'].map(h => (
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
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  Aún no hay pedidos registrados.
                </td>
              </tr>
            ) : orders.map((o, i) => {
              const hasReturn = o.returns?.length > 0
              const ret = hasReturn ? o.returns[0] : null
              const supplier = suppliers.find(s => s.id === o.supplierId)
              return (
                <tr key={o.id} style={{
                  borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(o.date).toLocaleDateString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text)' }}>
                    {supplier?.name ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {Number(o.kgOrdered).toFixed(1)} kg
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    ${Number(o.pricePerKg).toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--warning)', fontWeight: 600 }}>
                    ${Number(o.totalCost).toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {ret ? `${Number(ret.kgReturned).toFixed(1)} kg` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--success)' }}>
                    {ret ? `${Number(ret.kgSold).toFixed(1)} kg` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {!hasReturn && (
                      <button
                        onClick={() => {
                          setSelectedOrder(o)
                          setShowReturn(true)
                        }}
                        style={{
                          fontSize: 12, padding: '4px 12px',
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: 6, color: 'var(--muted)',
                          cursor: 'pointer',
                        }}
                      >
                        Registrar devolución
                      </button>
                    )}
                    {hasReturn && (
                      <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Cerrado</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal compra de pan */}
      {showOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '32px',
            width: '100%', maxWidth: 440,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 700,
              color: 'var(--text)', marginBottom: 24,
            }}>
              Registrar compra de pan
            </h2>
            <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Proveedor</label>
                <select style={inputStyle} value={orderForm.supplierId}
                  onChange={e => setOrderForm({ ...orderForm, supplierId: e.target.value })}>
                  <option value="">Sin proveedor</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Kg comprados *</label>
                  <input required type="number" step="0.1" style={inputStyle}
                    value={orderForm.kgOrdered}
                    onChange={e => setOrderForm({ ...orderForm, kgOrdered: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Precio por kg *</label>
                  <input required type="number" style={inputStyle}
                    value={orderForm.pricePerKg}
                    onChange={e => setOrderForm({ ...orderForm, pricePerKg: e.target.value })} />
                </div>
              </div>
              {orderForm.kgOrdered && orderForm.pricePerKg && (
                <div style={{
                  padding: '12px 14px', background: 'rgba(14,165,233,0.08)',
                  borderRadius: 8, border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Total estimado</p>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22, fontWeight: 700, color: 'var(--cyan)',
                  }}>
                    ${(Number(orderForm.kgOrdered) * Number(orderForm.pricePerKg)).toLocaleString('es-CL')}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowOrder(false)} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '11px', background: 'var(--cyan)',
                  color: 'var(--bg)', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  {loading ? 'Guardando...' : 'Registrar compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal devolución */}
      {showReturn && selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '32px',
            width: '100%', maxWidth: 440,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 700,
              color: 'var(--text)', marginBottom: 8,
            }}>
              Registrar devolución
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Pedido de {Number(selectedOrder.kgOrdered).toFixed(1)} kg
            </p>
            <form onSubmit={handleReturn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Kg devueltos *</label>
                  <input required type="number" step="0.1" style={inputStyle}
                    value={returnForm.kgReturned}
                    onChange={e => setReturnForm({ ...returnForm, kgReturned: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Kg vendidos *</label>
                  <input required type="number" step="0.1" style={inputStyle}
                    value={returnForm.kgSold}
                    onChange={e => setReturnForm({ ...returnForm, kgSold: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Kg perdidos</label>
                  <input type="number" step="0.1" style={inputStyle}
                    value={returnForm.kgLost}
                    onChange={e => setReturnForm({ ...returnForm, kgLost: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Monto acreditado</label>
                  <input type="number" style={inputStyle}
                    value={returnForm.amountCredited}
                    onChange={e => setReturnForm({ ...returnForm, amountCredited: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => { setShowReturn(false); setSelectedOrder(null) }} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '11px', background: 'var(--cyan)',
                  color: 'var(--bg)', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  {loading ? 'Guardando...' : 'Registrar devolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
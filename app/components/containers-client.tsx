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

export default function ContainersClient({ containers, movements, customers, tenantId }: {
  containers: any[]
  movements:  any[]
  customers:  any[]
  tenantId:   number
}) {
  const [showNewContainer, setShowNewContainer] = useState(false)
  const [showMovement, setShowMovement]         = useState(false)
  const [moveType, setMoveType]                 = useState<'out' | 'return'>('out')
  const [loading, setLoading]                   = useState(false)
  const [containerForm, setContainerForm]       = useState({ name: '', depositValue: '' })
  const [movementForm, setMovementForm]         = useState({
    customerId: '', containerId: '', qty: '1', note: '',
  })
  const [customerSearch, setCustomerSearch]     = useState('')
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(customerSearch))
  )

  // Calcular deuda por cliente
  const debtByCustomer = customers.map(c => {
    const outs    = movements.filter(m => m.customerId === c.id && m.type === 'out')
    const returns = movements.filter(m => m.customerId === c.id && m.type === 'return')
    const totalOut    = outs.reduce((s, m) => s + m.qty, 0)
    const totalReturn = returns.reduce((s, m) => s + m.qty, 0)
    const pending = totalOut - totalReturn
    const container = containers.find(cont =>
      outs.length > 0 ? cont.id === outs[0].containerId : false
    )
    const debt = pending * Number(container?.depositValue ?? 0)
    return { ...c, pending, debt }
  }).filter(c => c.pending > 0)

  const totalEnvasesFuera = movements
    .filter(m => m.type === 'out').reduce((s, m) => s + m.qty, 0) -
    movements.filter(m => m.type === 'return').reduce((s, m) => s + m.qty, 0)

  async function handleContainer(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/containers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'container', tenantId, ...containerForm }),
    })
    setLoading(false)
    setShowNewContainer(false)
    setContainerForm({ name: '', depositValue: '' })
    window.location.reload()
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/containers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:        'movement',
        tenantId,
        moveType,
        customerId:  selectedCustomer?.id || null,
        containerId: movementForm.containerId,
        qty:         movementForm.qty,
        note:        movementForm.note,
        }),
    })
    setLoading(false)
    setShowMovement(false)
    setMovementForm({ customerId: '', containerId: '', qty: '1', note: '' })
    setSelectedCustomer(null)
    setCustomerSearch('')
    window.location.reload()
  }

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Tipos de envase',    value: String(containers.length),      color: 'var(--cyan)' },
          { label: 'Envases en la calle',value: String(totalEnvasesFuera),      color: 'var(--warning)' },
          { label: 'Clientes con deuda', value: String(debtByCustomer.length),  color: 'var(--danger)' },
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
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={() => setShowNewContainer(true)} style={{
          padding: '10px 16px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 8,
          color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
        }}>
          + Tipo de envase
        </button>
        <button onClick={() => { setMoveType('out'); setShowMovement(true) }} style={{
          padding: '10px 20px', background: 'var(--cyan)',
          color: 'var(--bg)', border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Entregar envase
        </button>
        <button onClick={() => { setMoveType('return'); setShowMovement(true) }} style={{
          padding: '10px 20px', background: 'var(--success)',
          color: '#fff', border: 'none', borderRadius: 8,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Recibir devolución
        </button>
      </div>

      {/* Clientes con deuda */}
      {debtByCustomer.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15, fontWeight: 600, color: 'var(--text)',
            }}>
              Clientes con envases pendientes
            </h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Cliente', 'Teléfono', 'Envases pendientes', 'Deuda estimada'].map(h => (
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
              {debtByCustomer.map((c, i) => (
                <tr key={c.id} style={{
                  borderBottom: i < debtByCustomer.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {c.phone ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--warning)',
                    }}>
                      {c.pending} envases
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--danger)', fontWeight: 600 }}>
                    ${c.debt.toLocaleString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historial de movimientos */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600, color: 'var(--text)',
          }}>
            Últimos movimientos
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Fecha', 'Cliente', 'Envase', 'Tipo', 'Cantidad', 'Nota'].map(h => (
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
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  Aún no hay movimientos registrados.
                </td>
              </tr>
            ) : movements.slice(0, 20).map((m, i) => {
              const customer  = customers.find(c => c.id === m.customerId)
              const container = containers.find(c => c.id === m.containerId)
              return (
                <tr key={m.id} style={{
                  borderBottom: i < movements.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(m.date).toLocaleDateString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {customer?.name ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {container?.name ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 100,
                      background: m.type === 'out' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      color: m.type === 'out' ? 'var(--warning)' : 'var(--success)',
                    }}>
                      {m.type === 'out' ? 'Entregado' : 'Devuelto'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {m.qty}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {m.note ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo tipo de envase */}
      {showNewContainer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '32px',
            width: '100%', maxWidth: 400,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 700,
              color: 'var(--text)', marginBottom: 24,
            }}>
              Nuevo tipo de envase
            </h2>
            <form onSubmit={handleContainer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input required style={inputStyle} placeholder="Ej: Bidón 5L"
                  value={containerForm.name}
                  onChange={e => setContainerForm({ ...containerForm, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Valor depósito (opcional)</label>
                <input type="number" style={inputStyle} placeholder="0"
                  value={containerForm.depositValue}
                  onChange={e => setContainerForm({ ...containerForm, depositValue: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowNewContainer(false)} style={{
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
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal movimiento */}
      {showMovement && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '32px',
            width: '100%', maxWidth: 420,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 700,
              color: 'var(--text)', marginBottom: 24,
            }}>
              {moveType === 'out' ? 'Entregar envase' : 'Recibir devolución'}
            </h2>
            <form onSubmit={handleMovement} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Cliente con búsqueda */}
              <div>
                <label style={labelStyle}>Cliente</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={customerSearch}
                    onChange={e => {
                      setCustomerSearch(e.target.value)
                      setShowCustomerList(true)
                      if (!e.target.value) setSelectedCustomer(null)
                    }}
                    onFocus={() => setShowCustomerList(true)}
                    style={inputStyle}
                  />
                  {showCustomerList && customerSearch && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, zIndex: 50,
                      maxHeight: 160, overflowY: 'auto',
                      marginTop: 4,
                    }}>
                      {filteredCustomers.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => {
                            setSelectedCustomer(c)
                            setCustomerSearch(c.name)
                            setShowCustomerList(false)
                          }}
                          style={{
                            width: '100%', padding: '10px 14px',
                            textAlign: 'left', background: 'none',
                            border: 'none', cursor: 'pointer',
                            color: 'var(--text)', fontSize: 13,
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          {c.name} {c.phone && `· ${c.phone}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Tipo de envase *</label>
                <select required style={inputStyle}
                  value={movementForm.containerId}
                  onChange={e => setMovementForm({ ...movementForm, containerId: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {containers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {Number(c.depositValue) > 0 && `— $${Number(c.depositValue).toLocaleString('es-CL')}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Cantidad *</label>
                <input required type="number" min="1" style={inputStyle}
                  value={movementForm.qty}
                  onChange={e => setMovementForm({ ...movementForm, qty: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Nota</label>
                <input style={inputStyle} placeholder="Opcional..."
                  value={movementForm.note}
                  onChange={e => setMovementForm({ ...movementForm, note: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => {
                  setShowMovement(false)
                  setSelectedCustomer(null)
                  setCustomerSearch('')
                }} style={{
                  flex: 1, padding: '11px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: '11px',
                  background: moveType === 'out' ? 'var(--cyan)' : 'var(--success)',
                  color: moveType === 'out' ? 'var(--bg)' : '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  {loading ? 'Guardando...' : moveType === 'out' ? 'Entregar' : 'Recibir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
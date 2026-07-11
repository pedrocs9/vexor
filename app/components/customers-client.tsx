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

const paymentLabels: any = {
  cash: 'Efectivo', debit: 'Débito',
  credit: 'Crédito', transfer: 'Transferencia', fiado: 'Fiado',
}

export default function CustomersClient({ customers, tenantId }: {
  customers: any[]
  tenantId:  number
}) {
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState<any>(null)
  const [detail, setDetail]               = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [editMode, setEditMode]           = useState(false)
  const [editForm, setEditForm]           = useState<any>(null)
  const [editLoading, setEditLoading]     = useState(false)
  const [activeTab, setActiveTab]         = useState<'sales' | 'debts'>('sales')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.rut && c.rut.includes(search))
  )

  const totalSpent   = customers.reduce((s, c) => s + c.totalSpent, 0)
  const totalDebt    = customers.reduce((s, c) => s + c.totalDebt, 0)
  const withDebt     = customers.filter(c => c.totalDebt > 0).length

  async function loadDetail(customer: any) {
    setSelected(customer)
    setLoadingDetail(true)
    setDetail(null)
    setEditMode(false)
    const data = await fetch(`/api/customers/${customer.id}`).then(r => r.json())
    setDetail(data)
    setLoadingDetail(false)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true)
    await fetch(`/api/customers/${selected.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(editForm),
    })
    setEditLoading(false)
    setEditMode(false)
    window.location.reload()
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total clientes',    value: String(customers.length),                    color: 'var(--cyan)' },
          { label: 'Total facturado',   value: `$${totalSpent.toLocaleString('es-CL')}`,    color: 'var(--success)' },
          { label: 'Clientes con deuda',value: String(withDebt),                            color: withDebt > 0 ? 'var(--danger)' : 'var(--muted)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Búsqueda */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text" placeholder="Buscar por nombre, teléfono o RUT..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 380 }}
        />
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Nombre', 'Teléfono', 'Compras', 'Total gastado', 'Deuda pendiente', 'Última compra', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                {customers.length === 0 ? 'Aún no hay clientes registrados.' : 'No se encontraron clientes.'}
              </td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>{c.phone ?? '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>{c.salesCount}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  ${c.totalSpent.toLocaleString('es-CL')}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {c.totalDebt > 0 ? (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>
                      ${c.totalDebt.toLocaleString('es-CL')}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Sin deuda</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {c.lastSale ? new Date(c.lastSale).toLocaleDateString('es-CL') : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => loadDetail(c)} style={{ fontSize: 12, padding: '4px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal detalle cliente */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                  {selected.name}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {selected.phone && `📱 ${selected.phone}`}
                  {selected.rut && ` · RUT: ${selected.rut}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditMode(true); setEditForm({ name: selected.name, phone: selected.phone ?? '', rut: selected.rut ?? '' }) }}
                  style={{ fontSize: 12, padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => { setSelected(null); setDetail(null) }}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>
            </div>

            {/* Editar */}
            {editMode && (
              <form onSubmit={handleEdit} style={{ background: 'var(--bg2)', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input required style={inputStyle} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input style={inputStyle} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>RUT</label>
                    <input style={inputStyle} value={editForm.rut} onChange={e => setEditForm({ ...editForm, rut: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setEditMode(false)} style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={editLoading} style={{ flex: 1, padding: '9px', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {editLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {/* Stats del cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total compras',  value: String(selected.salesCount),                       color: 'var(--text)' },
                { label: 'Total gastado',  value: `$${selected.totalSpent.toLocaleString('es-CL')}`, color: 'var(--success)' },
                { label: 'Deuda pendiente',value: `$${selected.totalDebt.toLocaleString('es-CL')}`,  color: selected.totalDebt > 0 ? 'var(--danger)' : 'var(--success)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['sales', 'debts'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 13,
                  border: '1px solid var(--border)', cursor: 'pointer',
                  background: activeTab === tab ? 'var(--cyan)' : 'transparent',
                  color:      activeTab === tab ? 'var(--bg)'  : 'var(--muted)',
                  fontWeight: activeTab === tab ? 600 : 400,
                }}>
                  {tab === 'sales' ? '🧾 Compras' : '📋 Deudas'}
                </button>
              ))}
            </div>

            {loadingDetail ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>Cargando...</p>
            ) : detail && (
              <>
                {activeTab === 'sales' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detail.sales.length === 0
                      ? <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px' }}>Sin compras registradas.</p>
                      : detail.sales.map((sale: any, i: number) => (
                        <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                              {new Date(sale.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(14,165,233,0.1)', color: 'var(--cyan)' }}>
                                {paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}
                              </span>
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                                ${Number(sale.total).toLocaleString('es-CL')}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {sale.items.map((item: any, j: number) => (
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                                <span>{item.productName} × {Number(item.qty).toFixed(1)}</span>
                                <span>${Number(item.subtotal).toLocaleString('es-CL')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {activeTab === 'debts' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detail.debts.length === 0
                      ? <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px' }}>Sin deudas registradas.</p>
                      : detail.debts.map((debt: any, i: number) => (
                        <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${debt.status === 'pending' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                              {new Date(debt.createdAt).toLocaleDateString('es-CL')}
                            </span>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: debt.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: debt.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                              {debt.status === 'paid' ? 'Pagada' : 'Pendiente'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: 'var(--muted)' }}>Total: ${Number(debt.amount).toLocaleString('es-CL')}</span>
                            <span style={{ color: 'var(--muted)' }}>Pagado: ${Number(debt.paid).toLocaleString('es-CL')}</span>
                            <span style={{ fontWeight: 700, color: debt.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                              Saldo: ${Number(debt.balance).toLocaleString('es-CL')}
                            </span>
                          </div>
                          {debt.payments.length > 0 && (
                            <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Abonos:</p>
                              {debt.payments.map((p: any, j: number) => (
                                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--success)' }}>
                                  <span>{new Date(p.createdAt).toLocaleDateString('es-CL')}</span>
                                  <span>+${Number(p.amount).toLocaleString('es-CL')}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
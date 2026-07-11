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

export default function DebtsClient({ debts, customers, sales, tenantId }: {
  debts:     any[]
  customers: any[]
  sales:     any[]
  tenantId:  number
}) {
  const [selectedDebt, setSelectedDebt]   = useState<any>(null)
  const [payments, setPayments]           = useState<any[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [showPayment, setShowPayment]     = useState(false)
  const [payAmount, setPayAmount]         = useState('')
  const [payNote, setPayNote]             = useState('')
  const [payLoading, setPayLoading]       = useState(false)
  const [search, setSearch]               = useState('')
  const [filter, setFilter]               = useState<'all' | 'pending' | 'paid'>('pending')

  const pendingDebts = debts.filter(d => d.status === 'pending')
  const totalPending = pendingDebts.reduce((s, d) => s + Number(d.balance), 0)
  const totalDebt    = debts.reduce((s, d) => s + Number(d.amount), 0)
  const paidDebts    = debts.filter(d => d.status === 'paid')

  const customerDebts = customers.map(c => {
    const cDebts   = debts.filter(d => d.customerId === c.id && d.status === 'pending')
    const balance  = cDebts.reduce((s, d) => s + Number(d.balance), 0)
    const count    = cDebts.length
    return { ...c, balance, count, debts: cDebts }
  }).filter(c => c.balance > 0)

  const filtered = (filter === 'all' ? debts : debts.filter(d => d.status === filter))
    .filter(d => {
      const customer = customers.find(c => c.id === d.customerId)
      return customer?.name.toLowerCase().includes(search.toLowerCase())
    })

  async function loadPayments(debt: any) {
    setSelectedDebt(debt)
    setLoadingPayments(true)
    const res  = await fetch(`/api/debts/${debt.id}`)
    const data = await res.json()
    setPayments(data)
    setLoadingPayments(false)
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!payAmount || !selectedDebt) return
    setPayLoading(true)
    await fetch(`/api/debts/${selectedDebt.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(payAmount), note: payNote }),
    })
    setPayLoading(false)
    setShowPayment(false)
    setPayAmount('')
    setPayNote('')
    window.location.reload()
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total adeudado',    value: `$${totalPending.toLocaleString('es-CL')}`,      color: 'var(--danger)' },
          { label: 'Deudas pendientes', value: String(pendingDebts.length),                      color: 'var(--warning)' },
          { label: 'Clientes con deuda',value: String(customerDebts.length),                     color: 'var(--cyan)' },
          { label: 'Deudas pagadas',    value: String(paidDebts.length),                         color: 'var(--success)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Resumen por cliente */}
      {customerDebts.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '20px', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Clientes con deuda pendiente
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {customerDebts.map(c => (
              <div key={c.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{c.count} venta{c.count > 1 ? 's' : ''} pendiente{c.count > 1 ? 's' : ''}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>
                  ${c.balance.toLocaleString('es-CL')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text" placeholder="Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 280 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {(['pending', 'all', 'paid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: filter === f ? 'var(--cyan)' : 'transparent',
              color:      filter === f ? 'var(--bg)'  : 'var(--muted)',
            }}>
              {f === 'pending' ? 'Pendientes' : f === 'paid' ? 'Pagadas' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla deudas */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Cliente', 'Fecha', 'Monto original', 'Pagado', 'Saldo', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No hay deudas en este filtro.</td></tr>
            ) : filtered.map((debt, i) => {
              const customer = customers.find(c => c.id === debt.customerId)
              return (
                <tr key={debt.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                    {customer?.name ?? '—'}
                    {customer?.phone && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{customer.phone}</p>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                    {new Date(debt.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                    ${Number(debt.amount).toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--success)' }}>
                    ${Number(debt.paid).toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: debt.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                      ${Number(debt.balance).toLocaleString('es-CL')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: debt.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: debt.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                      {debt.status === 'paid' ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', display: 'flex', gap: 6 }}>
                    <button onClick={() => loadPayments(debt)} style={{ fontSize: 12, padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}>
                      Ver
                    </button>
                    {debt.status === 'pending' && (
                      <button onClick={() => { loadPayments(debt); setShowPayment(true) }} style={{ fontSize: 12, padding: '4px 10px', background: 'var(--cyan)', border: 'none', borderRadius: 6, color: 'var(--bg)', cursor: 'pointer', fontWeight: 600 }}>
                        Abonar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal detalle + pagos */}
      {selectedDebt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Deuda de {customers.find(c => c.id === selectedDebt.customerId)?.name}
              </h2>
              <button onClick={() => { setSelectedDebt(null); setShowPayment(false) }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>

            {/* Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total',   value: `$${Number(selectedDebt.amount).toLocaleString('es-CL')}`,  color: 'var(--text)' },
                { label: 'Pagado',  value: `$${Number(selectedDebt.paid).toLocaleString('es-CL')}`,    color: 'var(--success)' },
                { label: 'Saldo',   value: `$${Number(selectedDebt.balance).toLocaleString('es-CL')}`, color: 'var(--danger)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Historial de abonos */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Historial de abonos</h3>
            {loadingPayments ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '16px' }}>Cargando...</p>
            ) : payments.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '16px' }}>Sin abonos registrados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {payments.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--success)' }}>+${Number(p.amount).toLocaleString('es-CL')}</p>
                      {p.note && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{p.note}</p>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(p.createdAt).toLocaleDateString('es-CL')}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario abono */}
            {showPayment && selectedDebt.status === 'pending' && (
              <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Registrar abono</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Monto *</label>
                  <input required type="number" style={inputStyle}
                    max={Number(selectedDebt.balance)}
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder={`Máx: $${Number(selectedDebt.balance).toLocaleString('es-CL')}`}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button"
                    onClick={() => setPayAmount(String(selectedDebt.balance))}
                    style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
                    Pagar todo
                  </button>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nota</label>
                  <input style={inputStyle} value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Opcional..." />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowPayment(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={payLoading} style={{ flex: 2, padding: '10px', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {payLoading ? 'Guardando...' : 'Confirmar abono'}
                  </button>
                </div>
              </form>
            )}

            {!showPayment && selectedDebt.status === 'pending' && (
              <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '12px', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                Registrar abono
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
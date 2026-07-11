/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

export default function CashClient({
  todaySales, cashSales, debitSales, creditSales,
  transferSales, totalSales, allClosings,
  todayClosing, tenantId, userId,
}: {
  todaySales:    any[]
  cashSales:     number
  debitSales:    number
  creditSales:   number
  transferSales: number
  totalSales:    number
  allClosings:   any[]
  todayClosing:  any
  tenantId:      number
  userId:        number
}) {
  const [cashCounted, setCashCounted] = useState('')
  const [note, setNote]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(!!todayClosing)

  const difference = Number(cashCounted) - cashSales

  async function handleClose() {
    if (!cashCounted) return
    setLoading(true)
    await fetch('/api/cash-closings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, userId, cashCounted, note }),
    })
    setLoading(false)
    setDone(true)
    window.location.reload()
  }

  const inputStyle: any = {
    padding: '10px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)',
    fontSize: 14, outline: 'none', width: '100%',
  }

  return (
    <div>
      {/* Resumen del día */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Efectivo',       value: cashSales,     color: 'var(--success)', icon: '💵' },
          { label: 'Débito',         value: debitSales,    color: 'var(--cyan)',    icon: '💳' },
          { label: 'Crédito',        value: creditSales,   color: 'var(--warning)', icon: '💳' },
          { label: 'Transferencia',  value: transferSales, color: 'var(--muted)',   icon: '🏦' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</p>
              <span>{s.icon}</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 700, color: s.color,
            }}>
              ${s.value.toLocaleString('es-CL')}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Total y cierre */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '24px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16, fontWeight: 600,
            color: 'var(--text)', marginBottom: 20,
          }}>
            {done ? '✅ Caja cerrada' : '🏧 Cerrar caja del día'}
          </h2>

          <div style={{
            padding: '16px', background: 'var(--bg2)',
            borderRadius: 10, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>Total ventas del día</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20, fontWeight: 700, color: 'var(--cyan)',
              }}>
                ${totalSales.toLocaleString('es-CL')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Transacciones</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>
                {todaySales.length} ventas
              </span>
            </div>
          </div>

          {done ? (
            <div style={{
              padding: '16px', borderRadius: 10,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid var(--success)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
                Caja cerrada correctamente
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                Efectivo contado: ${Number(todayClosing?.cashCounted ?? 0).toLocaleString('es-CL')}
              </p>
              <p style={{
                fontSize: 13, marginTop: 4,
                color: Number(todayClosing?.difference ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                Diferencia: ${Number(todayClosing?.difference ?? 0).toLocaleString('es-CL')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Efectivo contado en caja *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashCounted}
                  onChange={e => setCashCounted(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {cashCounted && (
                <div style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: difference >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${difference >= 0 ? 'var(--success)' : 'var(--danger)'}`,
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    {difference >= 0 ? 'Sobrante' : 'Faltante'}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18, fontWeight: 700,
                    color: difference >= 0 ? 'var(--success)' : 'var(--danger)',
                  }}>
                    ${Math.abs(difference).toLocaleString('es-CL')}
                  </span>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Observaciones del cierre..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                onClick={handleClose}
                disabled={!cashCounted || loading}
                style={{
                  padding: '12px',
                  background: !cashCounted ? 'var(--surface)' : 'var(--cyan)',
                  color: !cashCounted ? 'var(--muted)' : 'var(--bg)',
                  border: 'none', borderRadius: 8,
                  fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 600,
                  cursor: !cashCounted ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Cerrando...' : 'Cerrar caja del día'}
              </button>
            </div>
          )}
        </div>

        {/* Detalle de ventas del día */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '24px',
          maxHeight: 400, overflowY: 'auto',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16, fontWeight: 600,
            color: 'var(--text)', marginBottom: 16,
          }}>
            Ventas del día ({todaySales.length})
          </h2>
          {todaySales.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              Aún no hay ventas hoy.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todaySales.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '8px 12px',
                  background: 'var(--bg2)', borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                      ${Number(s.total).toLocaleString('es-CL')}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {new Date(s.createdAt!).toLocaleTimeString('es-CL', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 100,
                    background: s.paymentMethod === 'cash'
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(14,165,233,0.1)',
                    color: s.paymentMethod === 'cash' ? 'var(--success)' : 'var(--cyan)',
                  }}>
                    {s.paymentMethod === 'cash' ? 'Efectivo'
                      : s.paymentMethod === 'debit' ? 'Débito'
                      : s.paymentMethod === 'credit' ? 'Crédito'
                      : 'Transferencia'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historial de cierres */}
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
            Historial de cierres
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Fecha', 'Total ventas', 'Efectivo esperado', 'Efectivo contado', 'Diferencia', 'Nota'].map(h => (
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
            {allClosings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  Aún no hay cierres registrados.
                </td>
              </tr>
            ) : allClosings.map((c, i) => (
              <tr key={c.id} style={{
                borderBottom: i < allClosings.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {new Date(c.date).toLocaleDateString('es-CL', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  ${Number(c.totalSales).toLocaleString('es-CL')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  ${Number(c.cashSales).toLocaleString('es-CL')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text)' }}>
                  ${Number(c.cashCounted).toLocaleString('es-CL')}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: Number(c.difference) >= 0 ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {Number(c.difference) >= 0 ? '+' : ''}
                    ${Number(c.difference).toLocaleString('es-CL')}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {c.note ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
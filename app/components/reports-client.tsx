/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

const PERIODS = [
  { label: 'Hoy',        days: 0 },
  { label: 'Esta semana', days: 7 },
  { label: 'Este mes',   days: 30 },
  { label: 'Todo',       days: 9999 },
]

export default function ReportsClient({ sales, items, products }: {
  sales:    any[]
  items:    any[]
  products: any[]
}) {
  const [period, setPeriod] = useState(30)

  const now = new Date()
  const filteredSales = sales.filter(s => {
    if (s.status === 'cancelled') return false
    if (period === 9999) return true
    const date = new Date(s.createdAt)
    if (period === 0) return date.toDateString() === now.toDateString()
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= period
  })

  const totalRevenue  = filteredSales.reduce((s, sale) => s + Number(sale.total), 0)
  const totalSales    = filteredSales.length
  const avgTicket     = totalSales > 0 ? totalRevenue / totalSales : 0
  const completedSales = filteredSales.filter(s => s.status === 'completed').length

  // Ventas por método de pago
  const byPayment = filteredSales.reduce((acc: any, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + Number(s.total)
    return acc
  }, {})

  // Productos más vendidos
  const saleIds = new Set(filteredSales.map(s => s.id))
  const filteredItems = items.filter(i => saleIds.has(i.saleId))

  const productSales = filteredItems.reduce((acc: any, item) => {
    const product = products.find(p => p.id === item.productId)
    if (!product) return acc
    if (!acc[item.productId]) {
      acc[item.productId] = { name: product.name, qty: 0, revenue: 0 }
    }
    acc[item.productId].qty     += Number(item.qty)
    acc[item.productId].revenue += Number(item.subtotal)
    return acc
  }, {})

  const topProducts = Object.values(productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10) as any[]

  // Ventas por día
  const salesByDay = filteredSales.reduce((acc: any, s) => {
    const day = new Date(s.createdAt).toLocaleDateString('es-CL')
    if (!acc[day]) acc[day] = { day, total: 0, count: 0 }
    acc[day].total += Number(s.total)
    acc[day].count += 1
    return acc
  }, {})

  const dailyData = Object.values(salesByDay)
    .sort((a: any, b: any) => new Date(a.day).getTime() - new Date(b.day).getTime())
    .slice(-14) as any[]

  const maxDaily = Math.max(...dailyData.map((d: any) => d.total), 1)

  const paymentLabels: any = {
    cash:     'Efectivo',
    debit:    'Débito',
    credit:   'Crédito',
    transfer: 'Transferencia',
  }

  return (
    <div>
      {/* Selector de período */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: period === p.days ? 'var(--cyan)' : 'transparent',
              color: period === p.days ? 'var(--bg)' : 'var(--muted)',
              fontWeight: period === p.days ? 600 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats principales */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Ingresos totales', value: `$${totalRevenue.toLocaleString('es-CL')}`, color: 'var(--cyan)' },
          { label: 'Ventas realizadas', value: String(totalSales), color: 'var(--success)' },
          { label: 'Ticket promedio',   value: `$${Math.round(avgTicket).toLocaleString('es-CL')}`, color: 'var(--warning)' },
          { label: 'Ventas completadas', value: String(completedSales), color: 'var(--text)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{s.label}</p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26, fontWeight: 700, color: s.color,
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Gráfico de ventas por día */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600,
            color: 'var(--text)', marginBottom: 20,
          }}>
            Ventas por día
          </h2>
          {dailyData.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
              Sin datos en este período
            </p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160 }}>
              {dailyData.map((d: any, i: number) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%',
                    height: `${(d.total / maxDaily) * 140}px`,
                    background: 'var(--cyan)',
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.8,
                    minHeight: 4,
                    transition: 'height .3s',
                  }} title={`$${d.total.toLocaleString('es-CL')}`} />
                  <span style={{ fontSize: 9, color: 'var(--muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                    {d.day.slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Por método de pago */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600,
            color: 'var(--text)', marginBottom: 20,
          }}>
            Por método de pago
          </h2>
          {Object.keys(byPayment).length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
              Sin datos en este período
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(byPayment).map(([method, amount]: any) => {
                const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
                return (
                  <div key={method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>
                        {paymentLabels[method] ?? method}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        ${Number(amount).toLocaleString('es-CL')} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: 'var(--cyan)', borderRadius: 3,
                        transition: 'width .3s',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Productos más vendidos */}
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
            Productos más vendidos
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Producto', 'Unidades vendidas', 'Ingresos'].map(h => (
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
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  Sin datos en este período
                </td>
              </tr>
            ) : topProducts.map((p: any, i: number) => (
              <tr key={i} style={{
                borderBottom: i < topProducts.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
                  {i + 1}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                  {p.name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--cyan)', fontWeight: 600 }}>
                  {Number(p.qty).toFixed(1)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
                  ${Number(p.revenue).toLocaleString('es-CL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Últimas ventas */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
        marginTop: 16,
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600, color: 'var(--text)',
          }}>
            Últimas ventas
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Fecha', 'Total', 'Pago', 'Estado'].map(h => (
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
            {filteredSales.slice(0, 15).map((s, i) => (
              <tr key={s.id} style={{
                borderBottom: i < Math.min(filteredSales.length, 15) - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {new Date(s.createdAt).toLocaleDateString('es-CL', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  ${Number(s.total).toLocaleString('es-CL')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {paymentLabels[s.paymentMethod] ?? s.paymentMethod}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 100,
                    background: s.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: s.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                  }}>
                    {s.status === 'completed' ? 'Completada' : 'Fiado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

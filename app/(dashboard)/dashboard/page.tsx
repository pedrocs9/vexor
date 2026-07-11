/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../lib/db'
import { sales, products, tenantSettings } from '../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import QuickAccess from '../../components/quick-access'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [allSales, allProducts, settings] = await Promise.all([
    db.select().from(sales)
      .where(eq(sales.tenantId, tenantId))
      .orderBy(desc(sales.createdAt)),
    db.select().from(products)
      .where(eq(products.tenantId, tenantId)),
    db.select().from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId)),
  ])

  const todaySales = allSales.filter(s =>
    new Date(s.createdAt!) >= today
  )

  const totalToday    = todaySales.reduce((s, sale) => s + Number(sale.total), 0)
  const countToday    = todaySales.length
  const avgTicket     = countToday > 0 ? totalToday / countToday : 0
  const lowStock      = allProducts.filter(p =>
    Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0
  )
  const recentSales   = allSales.slice(0, 8)
  const businessName  = settings[0]?.businessName ?? 'tu negocio'

  const paymentLabels: any = {
    cash: 'Efectivo', debit: 'Débito',
    credit: 'Crédito', transfer: 'Transferencia',
  }

  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Bienvenido, {user.name} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {businessName} · {today.toLocaleDateString('es-CL', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </p>
      </div>

      {/* Stats del día */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Ventas hoy',       value: `$${totalToday.toLocaleString('es-CL')}`, color: 'var(--cyan)',    icon: '💰' },
          { label: 'Transacciones',    value: String(countToday),                        color: 'var(--success)', icon: '🧾' },
          { label: 'Ticket promedio',  value: `$${Math.round(avgTicket).toLocaleString('es-CL')}`, color: 'var(--warning)', icon: '📊' },
          { label: 'Stock bajo',       value: String(lowStock.length),                   color: lowStock.length > 0 ? 'var(--danger)' : 'var(--success)', icon: '📦' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</p>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
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

        {/* Accesos rápidos */}
        <QuickAccess />

        {/* Stock bajo */}
        <div style={{
          background: 'var(--surface)',
          border: `1px solid ${lowStock.length > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
          borderRadius: 12, padding: '20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600,
            color: 'var(--text)', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {lowStock.length > 0 ? '⚠️' : '✅'} Stock bajo
            {lowStock.length > 0 && (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 100,
                background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
              }}>
                {lowStock.length} productos
              </span>
            )}
          </h2>
          {lowStock.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              Todo el inventario está en niveles normales.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '8px 12px',
                  background: 'var(--bg2)', borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)' }}>
                    {Number(p.stock)} {p.unit}
                  </span>
                </div>
              ))}
              {lowStock.length > 5 && (
                <Link href="/dashboard/inventario" style={{
                  fontSize: 12, color: 'var(--cyan)',
                  textDecoration: 'none', textAlign: 'center',
                  padding: '6px',
                }}>
                  Ver {lowStock.length - 5} más →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Últimas ventas */}
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
            Últimas ventas
          </h2>
          <Link href="/dashboard/reportes" style={{
            fontSize: 13, color: 'var(--cyan)', textDecoration: 'none',
          }}>
            Ver todos →
          </Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Fecha y hora', 'Total', 'Método de pago', 'Estado'].map(h => (
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
            {recentSales.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  Aún no hay ventas registradas. ¡Empieza vendiendo desde el POS!
                </td>
              </tr>
            ) : recentSales.map((s, i) => (
             <tr key={s.id} style={{
                borderBottom: i < recentSales.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {new Date(s.createdAt!).toLocaleDateString('es-CL', {
                    day: '2-digit', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
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
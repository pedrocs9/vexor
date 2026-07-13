/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../lib/db'
import { sales, products, tenantSettings } from '../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import QuickAccess from '../../components/quick-access'
import Badge from '../../components/ui/badge'
import Button from '../../components/ui/button'
import EmptyState from '../../components/ui/empty-state'
import Surface from '../../components/ui/surface'

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
  const todayLabel    = today.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const hasSalesToday = countToday > 0
  const hasAlerts     = lowStock.length > 0

  const paymentLabels: any = {
    cash: 'Efectivo', debit: 'Debito',
    credit: 'Credito', transfer: 'Transferencia',
  }

  return (
    <div className="v-page dashboard-page">
      <style>{`
        .dashboard-page {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background:
            linear-gradient(135deg, rgba(14,165,233,0.10), transparent 42%),
            var(--surface);
        }

        .dashboard-eyebrow {
          margin-bottom: 8px;
          color: var(--cyan-l);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .dashboard-title {
          margin-bottom: 8px;
          color: var(--text);
          font-family: var(--font-display);
          font-size: 30px;
          line-height: 1.12;
          font-weight: 700;
        }

        .dashboard-subtitle {
          max-width: 680px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .dashboard-hero-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .dashboard-primary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 20px;
          border-radius: 12px;
          background: var(--cyan);
          color: var(--bg);
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          transition: transform .15s ease, background .15s ease;
        }

        .dashboard-primary-action:hover {
          background: var(--cyan-l);
          transform: translateY(-1px);
        }

        .dashboard-primary-action:focus-visible,
        .dashboard-secondary-link:focus-visible,
        .dashboard-alert-link:focus-visible,
        .dashboard-table-link:focus-visible {
          outline: 2px solid var(--cyan-l);
          outline-offset: 3px;
        }

        .dashboard-status-pill {
          padding: 6px 10px;
          border: 1px solid ${hasAlerts ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.30)'};
          border-radius: 999px;
          background: ${hasAlerts ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.10)'};
          color: ${hasAlerts ? 'var(--danger)' : 'var(--success)'};
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, .65fr);
          gap: 20px;
          align-items: start;
        }

        .dashboard-section {
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          overflow: hidden;
        }

        .dashboard-section-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          padding: 20px 22px 0;
        }

        .dashboard-section-title {
          color: var(--text);
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
        }

        .dashboard-section-copy {
          margin-top: 4px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .dashboard-day-panel {
          padding: 22px;
        }

        .dashboard-day-total {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .dashboard-day-label {
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
        }

        .dashboard-day-amount {
          margin-top: 6px;
          color: var(--cyan-l);
          font-family: var(--font-display);
          font-size: 42px;
          line-height: 1;
          font-weight: 800;
        }

        .dashboard-day-note {
          max-width: 260px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
          text-align: right;
        }

        .dashboard-day-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding-top: 16px;
        }

        .dashboard-metric {
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg2);
        }

        .dashboard-metric-label {
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 12px;
        }

        .dashboard-metric-value {
          color: var(--text);
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
        }

        .dashboard-alert-panel {
          border-color: ${hasAlerts ? 'rgba(239,68,68,0.38)' : 'var(--border)'};
          background:
            linear-gradient(180deg, ${hasAlerts ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)'}, transparent 56%),
            var(--surface);
        }

        .dashboard-alert-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 22px 22px;
        }

        .dashboard-alert-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg2);
        }

        .dashboard-alert-name {
          overflow: hidden;
          color: var(--text);
          font-size: 13px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-alert-stock {
          color: var(--danger);
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .dashboard-alert-empty {
          padding: 18px 22px 22px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.55;
        }

        .dashboard-alert-link,
        .dashboard-table-link,
        .dashboard-secondary-link {
          color: var(--cyan-l);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .dashboard-support-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 20px;
          align-items: start;
        }

        .dashboard-activity-list {
          padding: 8px 22px 22px;
        }

        .dashboard-activity-table {
          width: 100%;
          border-collapse: collapse;
        }

        .dashboard-activity-table th {
          padding: 12px 0;
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-align: left;
          text-transform: uppercase;
        }

        .dashboard-activity-table td {
          padding: 15px 0;
          border-top: 1px solid var(--border);
          color: var(--muted);
          font-size: 13px;
        }

        .dashboard-activity-table td + td,
        .dashboard-activity-table th + th {
          padding-left: 18px;
        }

        .dashboard-sale-total {
          color: var(--text);
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
        }

        .dashboard-badge {
          display: inline-flex;
          align-items: center;
          min-height: 24px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .dashboard-badge-success {
          background: rgba(16,185,129,0.10);
          color: var(--success);
        }

        .dashboard-badge-warning {
          background: rgba(245,158,11,0.12);
          color: var(--warning);
        }

        .dashboard-empty-activity {
          padding: 42px 22px 46px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
          text-align: center;
        }

        .dashboard-quick-card {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
        }

        @media (max-width: 1180px) {
          .dashboard-main-grid,
          .dashboard-support-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .dashboard-page {
            padding: 20px 16px 28px;
            gap: 18px;
          }

          .dashboard-hero {
            grid-template-columns: 1fr;
            padding: 22px;
          }

          .dashboard-title {
            font-size: 24px;
          }

          .dashboard-hero-actions {
            align-items: stretch;
          }

          .dashboard-status-pill {
            width: fit-content;
            white-space: normal;
          }

          .dashboard-day-total {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-day-amount {
            font-size: 34px;
          }

          .dashboard-day-note {
            max-width: none;
            text-align: left;
          }

          .dashboard-day-metrics {
            grid-template-columns: 1fr;
          }

          .dashboard-section-header {
            flex-direction: column;
            padding: 18px 18px 0;
          }

          .dashboard-day-panel,
          .dashboard-alert-list,
          .dashboard-activity-list {
            padding-left: 18px;
            padding-right: 18px;
          }

          .dashboard-activity-table thead {
            display: none;
          }

          .dashboard-activity-table,
          .dashboard-activity-table tbody,
          .dashboard-activity-table tr,
          .dashboard-activity-table td {
            display: block;
            width: 100%;
          }

          .dashboard-activity-table tr {
            padding: 14px 0;
            border-top: 1px solid var(--border);
          }

          .dashboard-activity-table td {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 5px 0;
            border: 0;
          }

          .dashboard-activity-table td::before {
            content: attr(data-label);
            color: var(--muted);
            font-size: 12px;
            font-weight: 700;
          }
        }
      `}</style>

      <header className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">{businessName} · {todayLabel}</p>
          <h1 className="dashboard-title">Buenos dias, {user.name}</h1>
          <p className="dashboard-subtitle">
            {hasSalesToday
              ? `Hoy llevas ${countToday} ${countToday === 1 ? 'venta registrada' : 'ventas registradas'} por $${totalToday.toLocaleString('es-CL')}.`
              : 'Aun no hay ventas registradas hoy. El punto de venta esta listo para iniciar la operacion.'}
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <span className="dashboard-status-pill">
            {hasAlerts ? `${lowStock.length} productos requieren atencion` : 'Inventario sin alertas criticas'}
          </span>
          <Button href="/dashboard/pos" variant="primary" className="dashboard-primary-action">
            Abrir punto de venta
          </Button>
        </div>
      </header>

      <section className="dashboard-main-grid" aria-label="Estado operativo del dia">
        <Surface className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Estado del dia</h2>
              <p className="dashboard-section-copy">Ventas, transacciones y ticket promedio agrupados en una lectura operativa.</p>
            </div>
            <Link href="/dashboard/reportes" className="dashboard-secondary-link">
              Ver reportes
            </Link>
          </div>

          <div className="dashboard-day-panel">
            <div className="dashboard-day-total">
              <div>
                <p className="dashboard-day-label">Ventas acumuladas hoy</p>
                <p className="dashboard-day-amount">${totalToday.toLocaleString('es-CL')}</p>
              </div>
              <p className="dashboard-day-note">
                {hasSalesToday
                  ? 'El negocio ya tiene movimiento registrado durante la jornada.'
                  : 'Cuando se complete la primera venta, este bloque empezara a mostrar actividad del dia.'}
              </p>
            </div>

            <div className="dashboard-day-metrics">
              <div className="dashboard-metric">
                <p className="dashboard-metric-label">Transacciones</p>
                <p className="dashboard-metric-value">{countToday}</p>
              </div>
              <div className="dashboard-metric">
                <p className="dashboard-metric-label">Ticket promedio</p>
                <p className="dashboard-metric-value">${Math.round(avgTicket).toLocaleString('es-CL')}</p>
              </div>
            </div>
          </div>
        </Surface>

        <Surface as="aside" className="dashboard-section dashboard-alert-panel" aria-label="Atencion requerida">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Atencion requerida</h2>
              <p className="dashboard-section-copy">
                {hasAlerts ? 'Productos bajo su minimo definido.' : 'No hay productos bajo el minimo definido.'}
              </p>
            </div>
            {hasAlerts && (
              <Link href="/dashboard/inventario" className="dashboard-alert-link">
                Revisar
              </Link>
            )}
          </div>

          {hasAlerts ? (
            <div className="dashboard-alert-list">
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} className="dashboard-alert-item">
                  <span className="dashboard-alert-name">{p.name}</span>
                  <span className="dashboard-alert-stock">{Number(p.stock)} {p.unit}</span>
                </div>
              ))}
              {lowStock.length > 5 && (
                <Link href="/dashboard/inventario" className="dashboard-alert-link">
                  Ver {lowStock.length - 5} productos mas
                </Link>
              )}
            </div>
          ) : (
            <p className="dashboard-alert-empty">
              Todo el inventario esta en niveles normales segun los minimos configurados.
            </p>
          )}
        </Surface>
      </section>

      <section className="dashboard-support-grid">
        <Surface className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Actividad reciente</h2>
              <p className="dashboard-section-copy">Ultimas ventas registradas en el negocio.</p>
            </div>
            <Link href="/dashboard/reportes" className="dashboard-table-link">
              Ver todos
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <EmptyState
              className="dashboard-empty-activity"
              title="Aun no hay ventas registradas"
              description="Empieza vendiendo desde el punto de venta."
            />
          ) : (
            <div className="dashboard-activity-list">
              <table className="dashboard-activity-table">
                <thead>
                  <tr>
                    {['Fecha y hora', 'Total', 'Metodo de pago', 'Estado'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(s => (
                    <tr key={s.id}>
                      <td data-label="Fecha">
                        {new Date(s.createdAt!).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td data-label="Total">
                        <span className="dashboard-sale-total">${Number(s.total).toLocaleString('es-CL')}</span>
                      </td>
                      <td data-label="Pago">{paymentLabels[s.paymentMethod] ?? s.paymentMethod}</td>
                      <td data-label="Estado">
                        <Badge className="dashboard-badge" variant={s.status === 'completed' ? 'success' : 'warning'}>
                          {s.status === 'completed' ? 'Completada' : 'Fiado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Surface>

        <Surface as="aside" padded className="dashboard-quick-card" aria-label="Accesos rapidos">
          <QuickAccess />
        </Surface>
      </section>
    </div>
  )
}

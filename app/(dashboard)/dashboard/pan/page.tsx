/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { breadOrders, breadReturns, suppliers } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import BreadClient from '../../../components/bread-client'

export const dynamic = 'force-dynamic'

export default async function PanPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const [orders, allSuppliers] = await Promise.all([
    db.select().from(breadOrders)
      .where(eq(breadOrders.tenantId, tenantId))
      .orderBy(desc(breadOrders.date)),
    db.select().from(suppliers)
      .where(eq(suppliers.tenantId, tenantId)),
  ])

  const ordersWithReturns = await Promise.all(
    orders.map(async o => {
      const returns = await db.select().from(breadReturns)
        .where(eq(breadReturns.orderId, o.id))
      return { ...o, returns }
    })
  )

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Módulo de Pan 🍞
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Control diario de compras y devoluciones
        </p>
      </div>
      <BreadClient
        orders={ordersWithReturns}
        suppliers={allSuppliers}
        tenantId={tenantId}
      />
    </div>
  )
}
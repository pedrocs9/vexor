/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { debts, customers, sales } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import DebtsClient from '../../../components/debts-client'

export const dynamic = 'force-dynamic'

export default async function DeudasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const [allDebts, allCustomers, allSales] = await Promise.all([
    db.select().from(debts)
      .where(eq(debts.tenantId, tenantId))
      .orderBy(desc(debts.createdAt)),
    db.select().from(customers)
      .where(eq(customers.tenantId, tenantId)),
    db.select().from(sales)
      .where(eq(sales.tenantId, tenantId)),
  ])

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Deudas 📋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Control de ventas fiadas y abonos
        </p>
      </div>
      <DebtsClient
        debts={allDebts}
        customers={allCustomers}
        sales={allSales}
        tenantId={tenantId}
      />
    </div>
  )
}
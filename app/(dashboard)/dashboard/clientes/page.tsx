/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { customers, sales, debts } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import CustomersClient from '../../../components/customers-client'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const [allCustomers, allSales, allDebts] = await Promise.all([
    db.select().from(customers)
      .where(eq(customers.tenantId, tenantId))
      .orderBy(desc(customers.createdAt)),
    db.select().from(sales)
      .where(eq(sales.tenantId, tenantId)),
    db.select().from(debts)
      .where(eq(debts.tenantId, tenantId)),
  ])

  const customersWithStats = allCustomers.map(c => {
    const cSales   = allSales.filter(s => s.customerId === c.id)
    const cDebts   = allDebts.filter(d => d.customerId === c.id && d.status === 'pending')
    const totalSpent  = cSales.reduce((s, sale) => s + Number(sale.total), 0)
    const totalDebt   = cDebts.reduce((s, d) => s + Number(d.balance), 0)
    const lastSale    = cSales.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0]
    return {
      ...c,
      totalSpent,
      totalDebt,
      salesCount: cSales.length,
      lastSale:   lastSale?.createdAt ?? null,
    }
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Clientes 👥
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {allCustomers.length} clientes registrados
        </p>
      </div>
      <CustomersClient
        customers={customersWithStats}
        tenantId={tenantId}
      />
    </div>
  )
}
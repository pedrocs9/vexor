/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { sales, saleItems, products } from '../../../lib/schema'
import { eq, gte, desc } from 'drizzle-orm'
import ReportsClient from '../../../components/reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  if (user.role !== 'admin') redirect('/dashboard')

  const tenantId = user.tenantId

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [allSales, allItems, allProducts] = await Promise.all([
    db.select().from(sales)
      .where(eq(sales.tenantId, tenantId))
      .orderBy(desc(sales.createdAt)),
    db.select().from(saleItems),
    db.select().from(products)
      .where(eq(products.tenantId, tenantId)),
  ])

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Reportes 📈
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Resumen de ventas y métricas del negocio
        </p>
      </div>
      <ReportsClient
        sales={allSales}
        items={allItems}
        products={allProducts}
      />
    </div>
  )
}
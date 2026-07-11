/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { cashClosings, sales } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import CashClient from '../../../components/cash-client'

export const dynamic = 'force-dynamic'

export default async function CajaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [allSales, allClosings] = await Promise.all([
    db.select().from(sales)
      .where(eq(sales.tenantId, tenantId))
      .orderBy(desc(sales.createdAt)),
    db.select().from(cashClosings)
      .where(eq(cashClosings.tenantId, tenantId))
      .orderBy(desc(cashClosings.date)),
  ])

  const todaySales = allSales.filter(s =>
    new Date(s.createdAt!) >= today
  )

  const cashSales     = todaySales.filter(s => s.paymentMethod === 'cash')
    .reduce((s, sale) => s + Number(sale.total), 0)
  const debitSales    = todaySales.filter(s => s.paymentMethod === 'debit')
    .reduce((s, sale) => s + Number(sale.total), 0)
  const creditSales   = todaySales.filter(s => s.paymentMethod === 'credit')
    .reduce((s, sale) => s + Number(sale.total), 0)
  const transferSales = todaySales.filter(s => s.paymentMethod === 'transfer')
    .reduce((s, sale) => s + Number(sale.total), 0)
  const totalSales    = cashSales + debitSales + creditSales + transferSales

  const todayClosing = allClosings.find(c => {
    const date = new Date(c.date!)
    return date >= today
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Cierre de Caja 🏧
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {new Date().toLocaleDateString('es-CL', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </p>
      </div>
      <CashClient
        todaySales={todaySales}
        cashSales={cashSales}
        debitSales={debitSales}
        creditSales={creditSales}
        transferSales={transferSales}
        totalSales={totalSales}
        allClosings={allClosings}
        todayClosing={todayClosing ?? null}
        tenantId={tenantId}
        userId={Number(user.id)}
      />
    </div>
  )
}
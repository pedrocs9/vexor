import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { cashClosings, sales } from '../../lib/schema'
import { eq, gte } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId')
  if (!tenantId) return NextResponse.json([])

  const data = await db.select().from(cashClosings)
    .where(eq(cashClosings.tenantId, Number(tenantId)))

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantId, userId, cashCounted, note } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySales = await db.select().from(sales)
      .where(eq(sales.tenantId, Number(tenantId)))

    const filtered = todaySales.filter(s =>
      s.status !== 'cancelled' &&
      new Date(s.createdAt!) >= today
    )

    const cashSales     = filtered.filter(s => s.paymentMethod === 'cash')
      .reduce((s, sale) => s + Number(sale.total), 0)
    const debitSales    = filtered.filter(s => s.paymentMethod === 'debit')
      .reduce((s, sale) => s + Number(sale.total), 0)
    const creditSales   = filtered.filter(s => s.paymentMethod === 'credit')
      .reduce((s, sale) => s + Number(sale.total), 0)
    const transferSales = filtered.filter(s => s.paymentMethod === 'transfer')
      .reduce((s, sale) => s + Number(sale.total), 0)
    const totalSales    = cashSales + debitSales + creditSales + transferSales
    const difference    = Number(cashCounted) - cashSales

    const [closing] = await db.insert(cashClosings).values({
      tenantId:      Number(tenantId),
      userId:        userId || null,
      cashSales:     String(cashSales),
      debitSales:    String(debitSales),
      creditSales:   String(creditSales),
      transferSales: String(transferSales),
      totalSales:    String(totalSales),
      cashCounted:   String(cashCounted),
      difference:    String(difference),
      note:          note || null,
      status:        'closed',
    }).returning()

    return NextResponse.json(closing)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al cerrar caja' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { customers, sales, saleItems, debts, debtPayments, products } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [allSales, allDebts] = await Promise.all([
    db.select().from(sales)
      .where(eq(sales.customerId, Number(id)))
      .orderBy(desc(sales.createdAt)),
    db.select().from(debts)
      .where(eq(debts.customerId, Number(id))),
  ])

  const salesWithItems = await Promise.all(
    allSales.slice(0, 20).map(async sale => {
      const items = await db.select({
        qty:         saleItems.qty,
        price:       saleItems.price,
        subtotal:    saleItems.subtotal,
        productName: products.name,
      })
        .from(saleItems)
        .leftJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, sale.id))
      return { ...sale, items }
    })
  )

  const debtsWithPayments = await Promise.all(
    allDebts.map(async debt => {
      const payments = await db.select().from(debtPayments)
        .where(eq(debtPayments.debtId, debt.id))
      return { ...debt, payments }
    })
  )

  return NextResponse.json({ sales: salesWithItems, debts: debtsWithPayments })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }              = await params
  const { name, phone, rut } = await req.json()

  await db.update(customers)
    .set({ name, phone: phone || null, rut: rut || null })
    .where(eq(customers.id, Number(id)))

  return NextResponse.json({ ok: true })
}
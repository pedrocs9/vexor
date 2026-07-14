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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customerId = Number(id)

    const [customer] = await db.select().from(customers)
      .where(eq(customers.id, customerId))

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const [customerSale] = await db.select({ id: sales.id }).from(sales)
      .where(eq(sales.customerId, customerId))
      .limit(1)

    const [customerDebt] = await db.select({ id: debts.id }).from(debts)
      .where(eq(debts.customerId, customerId))
      .limit(1)

    if (customerSale || customerDebt) {
      return NextResponse.json({
        error: 'No se puede eliminar un cliente con compras o deudas asociadas',
      }, { status: 409 })
    }

    await db.delete(customers)
      .where(eq(customers.id, customerId))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 })
  }
}

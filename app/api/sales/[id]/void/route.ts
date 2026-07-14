import { NextRequest, NextResponse } from 'next/server'
import { and, eq, ne, sql } from 'drizzle-orm'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { cashClosings, debtPayments, debts, products, saleItems, sales } from '../../../../lib/schema'

function sameBusinessDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const user = session.user as { id?: string; role?: string; tenantId?: number }
  if (user.role !== 'admin' && user.role !== 'cajero') {
    return NextResponse.json({ error: 'No tienes permisos para anular ventas' }, { status: 403 })
  }

  try {
    const { id } = await params
    const saleId = Number(id)
    const tenantId = Number(user.tenantId)
    const userId = Number(user.id)
    const body = await req.json().catch(() => ({}))
    const reason = typeof body.reason === 'string' && body.reason.trim()
      ? body.reason.trim().slice(0, 240)
      : null

    const [sale] = await db.select().from(sales)
      .where(and(eq(sales.id, saleId), eq(sales.tenantId, tenantId)))

    if (!sale) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    if (sale.status === 'cancelled') {
      return NextResponse.json({ error: 'La venta ya fue anulada.' }, { status: 409 })
    }

    const allClosings = await db.select().from(cashClosings)
      .where(and(eq(cashClosings.tenantId, tenantId), eq(cashClosings.status, 'closed')))

    if (sale.createdAt && allClosings.some((closing) => closing.date && sameBusinessDay(new Date(closing.date), new Date(sale.createdAt!)))) {
      return NextResponse.json({ error: 'La caja de esta fecha ya fue cerrada. La anulacion requiere revision.' }, { status: 409 })
    }

    const [saleDebt] = await db.select().from(debts)
      .where(and(eq(debts.saleId, saleId), eq(debts.tenantId, tenantId)))

    if (saleDebt) {
      const payments = await db.select().from(debtPayments)
        .where(eq(debtPayments.debtId, saleDebt.id))

      if (payments.length > 0 || Number(saleDebt.paid) > 0) {
        return NextResponse.json({ error: 'La venta tiene abonos asociados y requiere revision antes de anularse.' }, { status: 409 })
      }
    }

    const [voidedSale] = await db.update(sales)
      .set({
        status: 'cancelled',
        voidedAt: new Date(),
        voidedBy: Number.isFinite(userId) ? userId : null,
        voidReason: reason,
      })
      .where(and(eq(sales.id, saleId), eq(sales.tenantId, tenantId), ne(sales.status, 'cancelled')))
      .returning()

    if (!voidedSale) {
      return NextResponse.json({ error: 'La venta ya fue anulada.' }, { status: 409 })
    }

    const items = await db.select().from(saleItems)
      .where(eq(saleItems.saleId, saleId))

    for (const item of items) {
      await db.update(products)
        .set({ stock: sql`${products.stock} + ${item.qty}` })
        .where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)))
    }

    if (saleDebt) {
      await db.update(debts)
        .set({
          balance: '0',
          status: 'cancelled',
        })
        .where(and(eq(debts.id, saleDebt.id), eq(debts.tenantId, tenantId)))
    }

    return NextResponse.json({ ok: true, sale: voidedSale })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'No pudimos anular la venta. No se realizaron cambios.' }, { status: 500 })
  }
}

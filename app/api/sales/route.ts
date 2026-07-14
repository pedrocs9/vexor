import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { sales, saleItems, products, debts, customers } from '../../lib/schema'
import { and, eq, sql } from 'drizzle-orm'
import { auth } from '../../lib/auth'

const paymentMethods = ['cash', 'debit', 'credit', 'transfer', 'fiado']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = session.user as { id?: string; role?: string; tenantId?: number }
    if (user.role !== 'admin' && user.role !== 'cajero') {
      return NextResponse.json({ error: 'No tienes permisos para registrar ventas' }, { status: 403 })
    }

    const body = await req.json()
    const { items, total, discount, paymentMethod, customerId, note } = body
    const tenantId = Number(user.tenantId)
    const userId = Number(user.id)
    const parsedCustomerId = customerId ? Number(customerId) : null
    const parsedTotal = Number(total)
    const parsedDiscount = Number(discount || 0)

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'La venta no tiene productos' }, { status: 400 })
    }

    if (!paymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'El medio de pago no es válido' }, { status: 400 })
    }

    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      return NextResponse.json({ error: 'El total de la venta no es válido' }, { status: 400 })
    }

    for (const item of items) {
      const qty = Number(item.qty)
      const price = Number(item.price)

      if (!Number.isFinite(Number(item.productId)) || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Hay productos con cantidad o precio inválido' }, { status: 400 })
      }
    }

    if (paymentMethod === 'fiado') {
      if (!parsedCustomerId || !Number.isFinite(parsedCustomerId)) {
        return NextResponse.json({ error: 'Selecciona un cliente para registrar la deuda' }, { status: 400 })
      }

      const [customer] = await db.select({ id: customers.id }).from(customers)
        .where(and(eq(customers.id, parsedCustomerId), eq(customers.tenantId, tenantId)))

      if (!customer) {
        return NextResponse.json({ error: 'El cliente seleccionado no existe o no pertenece a este negocio' }, { status: 400 })
      }
    }

    const [sale] = await db.insert(sales).values({
      tenantId,
      userId:        Number.isFinite(userId) ? userId : null,
      customerId:    parsedCustomerId,
      total:         String(parsedTotal),
      discount:      String(parsedDiscount),
      paymentMethod,
      status:        paymentMethod === 'fiado' ? 'credit' : 'completed',
      note:          note || null,
    }).returning()

    for (const item of items) {
      const qty = Number(item.qty)
      const price = Number(item.price)

      await db.insert(saleItems).values({
        saleId:    sale.id,
        productId: Number(item.productId),
        qty:       String(qty),
        price:     String(price),
        subtotal:  String(qty * price),
      })
      await db.update(products)
        .set({ stock: sql`${products.stock} - ${qty}` })
        .where(and(eq(products.id, Number(item.productId)), eq(products.tenantId, tenantId)))
    }

    if (paymentMethod === 'fiado' && parsedCustomerId) {
      await db.insert(debts).values({
        tenantId,
        customerId: parsedCustomerId,
        saleId:  sale.id,
        amount:  String(parsedTotal),
        paid:    '0',
        balance: String(parsedTotal),
        status:  'pending',
      })
    }

    return NextResponse.json({ ok: true, saleId: sale.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al procesar venta' }, { status: 500 })
  }
}

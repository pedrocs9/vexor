import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { sales, saleItems, products } from '../../lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantId, userId, items, total, discount, paymentMethod, customerId, note } = body

    const [sale] = await db.insert(sales).values({
      tenantId,
      userId,
      total:         String(total),
      discount:      String(discount || 0),
      paymentMethod,
      status:        paymentMethod === 'credit' ? 'credit' : 'completed',
      note:          note || null,
    }).returning()

    for (const item of items) {
      await db.insert(saleItems).values({
        saleId:    sale.id,
        productId: item.productId,
        qty:       String(item.qty),
        price:     String(item.price),
        subtotal:  String(item.qty * item.price),
      })

      await db.update(products)
        .set({ stock: sql`stock - ${item.qty}` })
        .where(eq(products.id, item.productId))
    }

    return NextResponse.json({ ok: true, saleId: sale.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al procesar venta' }, { status: 500 })
  }
}
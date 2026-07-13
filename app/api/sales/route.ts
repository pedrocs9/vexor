import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { sales, saleItems, products, debts } from '../../lib/schema'
import { and, eq, sql } from 'drizzle-orm'
import { auth } from '../../lib/auth'

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

    const sale = await db.transaction(async (tx) => {
      const [createdSale] = await tx.insert(sales).values({
        tenantId,
        userId:        Number.isFinite(userId) ? userId : null,
        customerId:    customerId || null,
        total:         String(total),
        discount:      String(discount || 0),
        paymentMethod,
        status:        paymentMethod === 'fiado' ? 'credit' : 'completed',
        note:          note || null,
      }).returning()

      for (const item of items) {
        await tx.insert(saleItems).values({
          saleId:    createdSale.id,
          productId: item.productId,
          qty:       String(item.qty),
          price:     String(item.price),
          subtotal:  String(item.qty * item.price),
        })
        await tx.update(products)
          .set({ stock: sql`${products.stock} - ${item.qty}` })
          .where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)))
      }

      if (paymentMethod === 'fiado' && customerId) {
        await tx.insert(debts).values({
          tenantId,
          customerId,
          saleId:  createdSale.id,
          amount:  String(total),
          paid:    '0',
          balance: String(total),
          status:  'pending',
        })
      }

      return createdSale
    })

    return NextResponse.json({ ok: true, saleId: sale.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al procesar venta' }, { status: 500 })
  }
}

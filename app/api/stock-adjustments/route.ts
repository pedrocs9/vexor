import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { stockAdjustments, products } from '../../lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { tenantId, productId, userId, type, qty, reason, note } = await req.json()

    await db.insert(stockAdjustments).values({
      tenantId:  Number(tenantId),
      productId: Number(productId),
      userId:    userId || null,
      type,
      qty:       String(qty),
      reason,
      note:      note || null,
    })

    if (type === 'add') {
      await db.update(products)
        .set({ stock: sql`stock + ${qty}` })
        .where(eq(products.id, Number(productId)))
    } else if (type === 'subtract') {
      await db.update(products)
        .set({ stock: sql`GREATEST(0, stock - ${qty})` })
        .where(eq(products.id, Number(productId)))
    } else if (type === 'set') {
      await db.update(products)
        .set({ stock: String(qty) })
        .where(eq(products.id, Number(productId)))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al ajustar stock' }, { status: 500 })
  }
}
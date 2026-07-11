import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { breadOrders, breadReturns } from '../../lib/schema'

export async function POST(req: NextRequest) {
  try {
    const { type, tenantId, supplierId, kgOrdered, pricePerKg, orderId, kgReturned, kgSold, kgLost, amountCredited } = await req.json()

    if (type === 'order') {
      const totalCost = Number(kgOrdered) * Number(pricePerKg)
      const [order] = await db.insert(breadOrders).values({
        tenantId,
        supplierId: supplierId || null,
        kgOrdered:  String(kgOrdered),
        pricePerKg: String(pricePerKg),
        totalCost:  String(totalCost),
      }).returning()
      return NextResponse.json(order)
    }

    if (type === 'return') {
      const [ret] = await db.insert(breadReturns).values({
        orderId,
        kgReturned:     String(kgReturned),
        kgSold:         String(kgSold),
        kgLost:         String(kgLost || 0),
        amountCredited: amountCredited ? String(amountCredited) : null,
      }).returning()
      return NextResponse.json(ret)
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
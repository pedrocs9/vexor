import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { sales, saleItems, products, customers, tenantSettings } from '../../../lib/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '../../../lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = session.user as { tenantId?: number }
    const { id } = await params
    const [sale] = await db.select().from(sales)
      .where(and(eq(sales.id, Number(id)), eq(sales.tenantId, Number(user.tenantId))))
    if (!sale) return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })

    const items = await db.select({
      qty:         saleItems.qty,
      price:       saleItems.price,
      subtotal:    saleItems.subtotal,
      productName: products.name,
    })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, Number(id)))

    const [settings] = await db.select().from(tenantSettings)
      .where(eq(tenantSettings.tenantId, sale.tenantId))

    let customer = null
    if (sale.customerId) {
      const [c] = await db.select().from(customers)
        .where(eq(customers.id, sale.customerId))
      customer = c ?? null
    }

    return NextResponse.json({ sale, items, settings: settings ?? null, customer })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener venta' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params
  return NextResponse.json(
    { error: 'Usa POST /api/sales/[id]/void para anular ventas.' },
    { status: 405 }
  )
}

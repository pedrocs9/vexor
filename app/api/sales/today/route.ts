import { NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { sales, saleItems, products } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '../../../lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json([], { status: 401 })

  const user = session.user as { tenantId?: number }
  const tenantId = Number(user.tenantId)
  if (!tenantId) return NextResponse.json([])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allSales = await db.select().from(sales)
    .where(eq(sales.tenantId, Number(tenantId)))
    .orderBy(desc(sales.createdAt))

  const todaySales = allSales.filter(s =>
    new Date(s.createdAt!) >= today
  )

  const salesWithItems = await Promise.all(
    todaySales.map(async sale => {
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

  return NextResponse.json(salesWithItems)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { products, customers, sales } from '../../lib/schema'
import { eq, ilike, or } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get('tenantId')
    const query    = req.nextUrl.searchParams.get('q')

    if (!tenantId || !query || query.length < 2) {
      return NextResponse.json({ products: [], customers: [], sales: [] })
    }

    const [allProducts, allCustomers] = await Promise.all([
      db.select().from(products)
        .where(or(
          eq(products.tenantId, Number(tenantId)),
        ))
        .limit(100),
      db.select().from(customers)
        .where(eq(customers.tenantId, Number(tenantId)))
        .limit(100),
    ])

    const q = query.toLowerCase()

    const filteredProducts = allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.includes(q))
    ).slice(0, 5)

    const filteredCustomers = allCustomers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.rut && c.rut.includes(q))
    ).slice(0, 5)

    return NextResponse.json({
      products:  filteredProducts,
      customers: filteredCustomers,
    })
  } catch (error) {
    return NextResponse.json({ products: [], customers: [] }, { status: 500 })
  }
}
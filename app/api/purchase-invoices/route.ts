import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { purchaseInvoices, purchaseInvoiceItems, products } from '../../lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId')
  if (!tenantId) return NextResponse.json([])

  const invoices = await db.select().from(purchaseInvoices)
    .where(eq(purchaseInvoices.tenantId, Number(tenantId)))

  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId, supplierId, invoiceNumber, date, note, items } = await req.json()

    const total = items.reduce((s: number, i: any) => s + Number(i.subtotal), 0)

    const [invoice] = await db.insert(purchaseInvoices).values({
      tenantId:      Number(tenantId),
      supplierId:    supplierId || null,
      invoiceNumber: invoiceNumber || null,
      date:          date ? new Date(date) : new Date(),
      total:         String(total),
      note:          note || null,
      status:        'paid',
    }).returning()

    for (const item of items) {
      await db.insert(purchaseInvoiceItems).values({
        invoiceId:   invoice.id,
        productId:   item.productId || null,
        productName: item.productName,
        qty:         String(item.qty),
        cost:        String(item.cost),
        subtotal:    String(item.subtotal),
      })

      if (item.productId) {
        await db.update(products)
          .set({
            stock: sql`stock + ${item.qty}`,
            cost:  String(item.cost),
          })
          .where(eq(products.id, item.productId))
      }
    }

    return NextResponse.json({ ok: true, id: invoice.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
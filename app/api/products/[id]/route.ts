import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { products } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    await db.update(products)
      .set({
        name:       body.name,
        sku:        body.sku || null,
        barcode:    body.barcode || null,
        price:      body.price,
        cost:       body.cost || null,
        stock:      body.stock,
        minStock:   body.minStock || '0',
        unit:       body.unit,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        imageUrl:   body.imageUrl || null,
      })
      .where(eq(products.id, Number(id)))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
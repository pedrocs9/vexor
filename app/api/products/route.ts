import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { products } from '../../lib/schema'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    await db.insert(products).values({
      tenantId:   body.tenantId,
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
      active:     true,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
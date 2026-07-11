import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { products, categories } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { tenantId, rows } = await req.json()

    let imported = 0
    let errors   = 0

    for (const row of rows) {
      try {
        let categoryId = null

        if (row.categoria) {
          const existing = await db.select().from(categories)
            .where(eq(categories.tenantId, Number(tenantId)))
          const found = existing.find(c =>
            c.name.toLowerCase() === row.categoria.toLowerCase()
          )
          if (found) {
            categoryId = found.id
          } else {
            const [newCat] = await db.insert(categories).values({
              tenantId: Number(tenantId),
              name:     row.categoria,
            }).returning()
            categoryId = newCat.id
          }
        }

        await db.insert(products).values({
          tenantId:   Number(tenantId),
          name:       row.nombre,
          sku:        row.sku        || null,
          barcode:    row.codigo     || null,
          price:      String(row.precio),
          cost:       row.costo      ? String(row.costo) : null,
          stock:      String(row.stock ?? 0),
          minStock:   String(row.stock_minimo ?? 0),
          unit:       row.unidad     || 'un',
          categoryId,
          active:     true,
        })
        imported++
      } catch {
        errors++
      }
    }

    return NextResponse.json({ ok: true, imported, errors })
  } catch (error) {
    return NextResponse.json({ error: 'Error al importar' }, { status: 500 })
  }
}
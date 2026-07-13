import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { products, categories } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get('tenantId')
    if (!tenantId) return NextResponse.json({ error: 'Sin tenantId' }, { status: 400 })

    const [allProducts, allCategories] = await Promise.all([
      db.select().from(products).where(eq(products.tenantId, Number(tenantId))),
      db.select().from(categories).where(eq(categories.tenantId, Number(tenantId))),
    ])

    const rows = allProducts.map(p => {
      const category = allCategories.find(c => c.id === p.categoryId)
      return {
        'Nombre':        p.name,
        'SKU':           p.sku ?? '',
        'Código barras': p.barcode ?? '',
        'Categoría':     category?.name ?? '',
        'Precio venta':  Number(p.price),
        'Costo':         p.cost ? Number(p.cost) : '',
        'Stock actual':  Number(p.stock),
        'Stock mínimo':  p.minStock ? Number(p.minStock) : 0,
        'Unidad':        p.unit,
        'Estado':        p.active ? 'Activo' : 'Inactivo',
        'Valor stock':   p.cost ? Number(p.stock) * Number(p.cost) : '',
      }
    })

    const wb  = XLSX.utils.book_new()
    const ws  = XLSX.utils.json_to_sheet(rows)

    ws['!cols'] = [
      { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 10 }, { wch: 10 }, { wch: 14 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="inventario-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.xlsx"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
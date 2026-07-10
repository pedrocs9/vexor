import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { categories } from '../../lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId')
  if (!tenantId) return NextResponse.json([])

  const data = await db.select().from(categories)
    .where(eq(categories.tenantId, Number(tenantId)))

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const { name, tenantId, parentId } = await req.json()

    const [cat] = await db.insert(categories).values({
      name,
      tenantId,
      parentId: parentId || null,
    }).returning()

    return NextResponse.json(cat)
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { customers } from '../../lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, rut, tenantId } = await req.json()

    const [customer] = await db.insert(customers).values({
      name, phone: phone || null,
      rut: rut || null, tenantId,
    }).returning()

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
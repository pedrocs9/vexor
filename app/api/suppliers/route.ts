import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { suppliers } from '../../lib/schema'

export async function POST(req: NextRequest) {
  try {
    const { name, rut, phone, email, tenantId } = await req.json()

    const [supplier] = await db.insert(suppliers).values({
      name, tenantId,
      rut:   rut   || null,
      phone: phone || null,
      email: email || null,
    }).returning()

    return NextResponse.json(supplier)
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
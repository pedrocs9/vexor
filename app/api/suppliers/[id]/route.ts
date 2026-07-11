import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { suppliers } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, rut, phone, email, active } = await req.json()

    await db.update(suppliers)
      .set({ name, rut: rut || null, phone: phone || null, email: email || null, active })
      .where(eq(suppliers.id, Number(id)))

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
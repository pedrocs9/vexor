import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { users } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }                       = await params
    const { name, role, active, password } = await req.json()

    const updateData: any = { name, role, active }
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, Number(id)))

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { users } from '../../lib/schema'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, tenantId } = await req.json()

    const passwordHash = await bcrypt.hash(password, 10)

    const [user] = await db.insert(users).values({
      name, email, passwordHash, role, tenantId, active: true,
    }).returning()

    return NextResponse.json({ ok: true, id: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
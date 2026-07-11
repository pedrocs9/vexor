import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { containers, containerMovements } from '../../lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { type, tenantId, name, depositValue, customerId, containerId, qty, note, moveType } = await req.json()

    if (type === 'container') {
      const [container] = await db.insert(containers).values({
        tenantId, name,
        depositValue: depositValue ? String(depositValue) : '0',
      }).returning()
      return NextResponse.json(container)
    }

    if (type === 'movement') {
      const [movement] = await db.insert(containerMovements).values({
        tenantId,
        customerId:  customerId  || null,
        containerId: Number(containerId),
        type:        moveType,
        qty:         Number(qty),
        note:        note || null,
      }).returning()
      return NextResponse.json(movement)
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
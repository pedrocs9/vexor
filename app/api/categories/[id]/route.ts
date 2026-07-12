import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { categories } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.delete(categories).where(eq(categories.id, Number(id)))
  return NextResponse.json({ ok: true })
}
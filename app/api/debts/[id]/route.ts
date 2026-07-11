import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'
import { debts, debtPayments } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const payments = await db.select().from(debtPayments)
    .where(eq(debtPayments.debtId, Number(id)))
  return NextResponse.json(payments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }       = await params
    const { amount, note } = await req.json()

    const [debt] = await db.select().from(debts).where(eq(debts.id, Number(id)))
    if (!debt) return NextResponse.json({ error: 'Deuda no encontrada' }, { status: 404 })

    await db.insert(debtPayments).values({
      debtId: Number(id),
      amount: String(amount),
      note:   note || null,
    })

    const newPaid    = Number(debt.paid) + Number(amount)
    const newBalance = Number(debt.amount) - newPaid
    const newStatus  = newBalance <= 0 ? 'paid' : 'pending'

    await db.update(debts).set({
      paid:    String(newPaid),
      balance: String(Math.max(0, newBalance)),
      status:  newStatus,
    }).where(eq(debts.id, Number(id)))

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
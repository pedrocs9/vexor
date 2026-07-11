import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { debts, debtPayments, customers } from '../../lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId')
  if (!tenantId) return NextResponse.json([])

  const allDebts = await db.select().from(debts)
    .where(eq(debts.tenantId, Number(tenantId)))
    .orderBy(desc(debts.createdAt))

  return NextResponse.json(allDebts)
}
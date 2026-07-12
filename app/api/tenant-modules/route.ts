import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { tenantModules, tenantSubscriptions } from '../../lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId')
  // eslint-disable-next-line @next/next/no-assign-module-variable
  const module   = req.nextUrl.searchParams.get('module')
  const all      = req.nextUrl.searchParams.get('all')

  if (!tenantId) return NextResponse.json({ active: true, suspended: false })

  if (all === 'true') {
    const modules = await db.select().from(tenantModules)
      .where(and(
        eq(tenantModules.tenantId, Number(tenantId)),
        eq(tenantModules.active, true),
      ))
    return NextResponse.json(modules.map(m => m.module))
  }

  if (!module) return NextResponse.json({ active: true, suspended: false })

  const [sub] = await db.select().from(tenantSubscriptions)
    .where(eq(tenantSubscriptions.tenantId, Number(tenantId)))

  if (sub?.status === 'suspended') {
    return NextResponse.json({ active: false, suspended: true })
  }

  const [mod] = await db.select().from(tenantModules)
    .where(and(
      eq(tenantModules.tenantId, Number(tenantId)),
      eq(tenantModules.module, module),
    ))

  return NextResponse.json({ active: mod?.active ?? false, suspended: false })
}
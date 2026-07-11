import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'
import { tenantSettings } from '../../lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId')
  if (!tenantId) return NextResponse.json(null)

  const [settings] = await db.select().from(tenantSettings)
    .where(eq(tenantSettings.tenantId, Number(tenantId)))

  return NextResponse.json(settings ?? null)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantId } = body

    const existing = await db.select().from(tenantSettings)
      .where(eq(tenantSettings.tenantId, Number(tenantId)))

    if (existing.length > 0) {
      await db.update(tenantSettings)
        .set({
          logoUrl:      body.logoUrl      || null,
          businessName: body.businessName || null,
          rut:          body.rut          || null,
          address:      body.address      || null,
          phone:        body.phone        || null,
          email:        body.email        || null,
          commune:      body.commune      || null,
          city:         body.city         || null,
          website:      body.website      || null,
          updatedAt:    new Date(),
        })
        .where(eq(tenantSettings.tenantId, Number(tenantId)))
    } else {
      await db.insert(tenantSettings).values({
        tenantId:     Number(tenantId),
        logoUrl:      body.logoUrl      || null,
        businessName: body.businessName || null,
        rut:          body.rut          || null,
        address:      body.address      || null,
        phone:        body.phone        || null,
        email:        body.email        || null,
        commune:      body.commune      || null,
        city:         body.city         || null,
        website:      body.website      || null,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
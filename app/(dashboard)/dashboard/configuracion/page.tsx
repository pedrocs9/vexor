/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { tenantSettings } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import SettingsClient from '../../../components/settings-client'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as any
  if (user.role !== 'admin') redirect('/dashboard')

  const tenantId = user.tenantId

  const [settings] = await db.select().from(tenantSettings)
    .where(eq(tenantSettings.tenantId, tenantId))

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Configuración ⚙️
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Información y datos de tu negocio
        </p>
      </div>
      <SettingsClient settings={settings ?? null} tenantId={tenantId} />
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { suppliers } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import SuppliersClient from '../../../components/suppliers-client'

export const dynamic = 'force-dynamic'

export default async function ProveedoresPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const allSuppliers = await db.select().from(suppliers)
    .where(eq(suppliers.tenantId, tenantId))

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Proveedores
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {allSuppliers.length} proveedores registrados
        </p>
      </div>
      <SuppliersClient suppliers={allSuppliers} tenantId={tenantId} />
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { containers, containerMovements, customers } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import ContainersClient from '../../../components/containers-client'

export const dynamic = 'force-dynamic'

export default async function EnvasesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const [allContainers, allMovements, allCustomers] = await Promise.all([
    db.select().from(containers).where(eq(containers.tenantId, tenantId)),
    db.select().from(containerMovements)
      .where(eq(containerMovements.tenantId, tenantId))
      .orderBy(desc(containerMovements.date)),
    db.select().from(customers).where(eq(customers.tenantId, tenantId)),
  ])

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Envases 🧴
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Control de envases prestados a clientes
        </p>
      </div>
      <ContainersClient
        containers={allContainers}
        movements={allMovements}
        customers={allCustomers}
        tenantId={tenantId}
      />
    </div>
  )
}
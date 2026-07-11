/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { users } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import UsersClient from '../../../components/users-client'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  if (user.role !== 'admin') redirect('/dashboard')

  const tenantId = user.tenantId

  const allUsers = await db.select({
    id:        users.id,
    name:      users.name,
    email:     users.email,
    role:      users.role,
    active:    users.active,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.tenantId, tenantId))

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Usuarios
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {allUsers.length} usuarios registrados
        </p>
      </div>
      <UsersClient users={allUsers} tenantId={tenantId} />
    </div>
  )
}
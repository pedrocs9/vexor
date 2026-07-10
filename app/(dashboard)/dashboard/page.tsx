/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user

  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg)',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700,
          color: 'var(--text)', marginBottom: 8,
        }}>
          Bienvenido, {user.name} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Rol: {(user as any).role} · Tenant: {(user as any).tenantId}        </p>
      </div>
    </main>
  )
}
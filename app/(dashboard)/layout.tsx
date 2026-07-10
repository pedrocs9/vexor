import { auth } from '../lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '../components/sidebar'
/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={session.user as any} />
      <main style={{
        flex: 1, marginLeft: 240,
        background: 'var(--bg)',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
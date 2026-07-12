/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../lib/auth'
import { redirect } from 'next/navigation'
import SidebarWrapper from '../components/sidebar-wrapper'
import ToastContainer from '../components/toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarWrapper user={session.user as any} />
      <main
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-w, 240px)",
          background: "var(--bg)",
          minHeight: "100vh",
          transition: "margin-left .25s ease",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <style>{`
    @media (max-width: 768px) {
      main { padding-top: 56px !important; margin-left: 0 !important; }
    }
  `}</style>
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
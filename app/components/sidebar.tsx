'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { label: 'Dashboard',   href: '/dashboard',            icon: '📊', roles: ['admin', 'cajero', 'bodeguero'] },
  { label: 'Inventario',  href: '/dashboard/inventario', icon: '📦', roles: ['admin', 'bodeguero'] },
  { label: 'Punto de venta', href: '/dashboard/pos',     icon: '💰', roles: ['admin', 'cajero'] },
  { label: 'Proveedores', href: '/dashboard/proveedores',icon: '🚚', roles: ['admin'] },
  { label: 'Pan',         href: '/dashboard/pan',        icon: '🍞', roles: ['admin', 'bodeguero'] },
  { label: 'Envases',     href: '/dashboard/envases',    icon: '🧴', roles: ['admin', 'cajero'] },
  { label: 'Reportes',    href: '/dashboard/reportes',   icon: '📈', roles: ['admin'] },
  { label: 'Usuarios',    href: '/dashboard/usuarios',   icon: '👥', roles: ['admin'] },
]

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  const links = NAV.filter(n => n.roles.includes(user.role))

  return (
    <aside style={{
      width: 240, position: 'fixed', top: 0, left: 0,
      height: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 14, fontWeight: 700, color: 'var(--bg)',
          }}>V</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
          }}>Vexor</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          {user.name}
        </p>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 100,
          background: 'rgba(14,165,233,0.1)', color: 'var(--cyan)',
          display: 'inline-block', marginTop: 4,
        }}>
          {user.role}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none',
                background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                color: active ? 'var(--cyan)' : 'var(--muted)',
                fontSize: 14, fontWeight: active ? 500 : 400,
                transition: 'background .15s, color .15s',
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid var(--border)',
      }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', padding: '9px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--muted)',
            fontSize: 14, cursor: 'pointer',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--danger)'
            e.currentTarget.style.color = 'var(--danger)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
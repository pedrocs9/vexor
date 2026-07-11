/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import ThemeToggle from './theme-toggle'

const NAV = [
  { label: 'Dashboard',     href: '/dashboard',               icon: '📊', roles: ['admin', 'cajero', 'bodeguero'] },
  { label: 'Inventario',    href: '/dashboard/inventario',    icon: '📦', roles: ['admin', 'bodeguero'] },
  { label: 'Punto de venta',href: '/dashboard/pos',           icon: '💰', roles: ['admin', 'cajero'] },
  { label: 'Proveedores',   href: '/dashboard/proveedores',   icon: '🚚', roles: ['admin'] },
  { label: 'Pan',           href: '/dashboard/pan',           icon: '🍞', roles: ['admin', 'bodeguero'] },
  { label: 'Envases',       href: '/dashboard/envases',       icon: '🧴', roles: ['admin', 'cajero'] },
  { label: 'Reportes',      href: '/dashboard/reportes',      icon: '📈', roles: ['admin'] },
  { label: 'Usuarios',      href: '/dashboard/usuarios',      icon: '👥', roles: ['admin'] },
  { label: 'Configuración', href: '/dashboard/configuracion', icon: '⚙️', roles: ['admin'] },
]

export default function Sidebar({ user, open, onToggle, mobile }: {
  user:     any
  open:     boolean
  onToggle: () => void
  mobile:   boolean
}) {
  const pathname              = usePathname()
  const [settings, setSettings] = useState<any>(null)
  const collapsed             = !open

  useEffect(() => {
    fetch(`/api/settings?tenantId=${user.tenantId}`)
      .then(r => r.json())
      .then(data => setSettings(data))
  }, [user.tenantId])

  const links = NAV.filter(n => n.roles.includes(user.role))

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      position: 'fixed', top: 0, left: 0,
      height: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      transition: 'width .25s ease',
      overflow: 'hidden',
      transform: mobile && !open ? 'translateX(-100%)' : 'translateX(0)',
    }}>

      {/* Header con toggle */}
      <div style={{
        padding: collapsed ? '20px 16px 16px' : '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{
                width: 32, height: 32, borderRadius: 8,
                objectFit: 'contain', background: '#fff', padding: 2, flexShrink: 0,
              }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'var(--cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 14, fontWeight: 700, color: 'var(--bg)',
              }}>V</div>
            )}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14, fontWeight: 700, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {settings?.businessName ?? 'Vexor'}
            </span>
          </div>
        )}

        {collapsed && (
          settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" style={{
              width: 32, height: 32, borderRadius: 8,
              objectFit: 'contain', background: '#fff', padding: 2,
            }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 14, fontWeight: 700, color: 'var(--bg)',
            }}>V</div>
          )
        )}

        <button
          onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: 'transparent',
            border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)',
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{user.name}</p>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 100,
            background: 'rgba(14,165,233,0.1)', color: 'var(--cyan)',
            display: 'inline-block', marginTop: 4,
          }}>
            {user.role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px' : '9px 12px',
                borderRadius: 8, marginBottom: 2,
                textDecoration: 'none',
                background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                color: active ? 'var(--cyan)' : 'var(--muted)',
                fontSize: 14, fontWeight: active ? 500 : 400,
                transition: 'background .15s, color .15s',
              }}
            >
              <span style={{ fontSize: collapsed ? 20 : 16 }}>{link.icon}</span>
              {!collapsed && link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid var(--border)',
      }}>
        {!collapsed && <ThemeToggle />}
        {collapsed && (
          <button
            onClick={() => {
              const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
              document.documentElement.setAttribute('data-theme', next)
              localStorage.setItem('vexor-theme', next)
            }}
            title="Cambiar tema"
            style={{
              width: '100%', padding: '9px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8, cursor: 'pointer', fontSize: 16,
              marginBottom: 8,
            }}
          >
            🌙
          </button>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title={collapsed ? 'Cerrar sesión' : undefined}
          style={{
            width: '100%', padding: collapsed ? '9px' : '9px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--muted)',
            fontSize: collapsed ? 16 : 14, cursor: 'pointer',
            transition: 'border-color .15s, color .15s',
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 8,
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
          {collapsed ? '🚪' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}
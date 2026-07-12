/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import ThemeToggle from './theme-toggle'

const NAV = [
  {
    type: 'link', label: 'Dashboard', href: '/dashboard',
    icon: '📊', roles: ['admin', 'cajero', 'bodeguero'], module: 'dashboard',
  },
  {
    type: 'group', label: 'Ventas', icon: '💼',
    roles: ['admin', 'cajero'],
    children: [
      { label: 'Punto de venta', href: '/dashboard/pos',     icon: '💰', roles: ['admin', 'cajero'],  module: 'pos' },
      { label: 'Cierre de caja', href: '/dashboard/caja',    icon: '🏧', roles: ['admin', 'cajero'],  module: 'cash' },
      { label: 'Deudas',         href: '/dashboard/deudas',  icon: '📋', roles: ['admin', 'cajero'],  module: 'debts' },
      { label: 'Clientes',       href: '/dashboard/clientes',icon: '👤', roles: ['admin', 'cajero'],  module: 'customers' },
    ],
  },
  {
    type: 'group', label: 'Inventario', icon: '📦',
    roles: ['admin', 'bodeguero'],
    children: [
      { label: 'Productos',          href: '/dashboard/inventario', icon: '📦', roles: ['admin', 'bodeguero'], module: 'inventory' },
      { label: 'Facturas de compra', href: '/dashboard/compras',    icon: '🧾', roles: ['admin', 'bodeguero'], module: 'purchases' },
      { label: 'Proveedores',        href: '/dashboard/proveedores',icon: '🚚', roles: ['admin'],              module: 'suppliers' },
    ],
  },
  {
    type: 'group', label: 'Distribución', icon: '🚛',
    roles: ['admin', 'bodeguero', 'cajero'],
    children: [
      { label: 'Pan',     href: '/dashboard/pan',     icon: '🍞', roles: ['admin', 'bodeguero'], module: 'bread' },
      { label: 'Envases', href: '/dashboard/envases', icon: '🧴', roles: ['admin', 'cajero'],    module: 'containers' },
    ],
  },
  {
    type: 'group', label: 'Análisis', icon: '📈',
    roles: ['admin'],
    children: [
      { label: 'Reportes', href: '/dashboard/reportes', icon: '📈', roles: ['admin'], module: 'reports' },
    ],
  },
  {
    type: 'group', label: 'Administración', icon: '⚙️',
    roles: ['admin'],
    children: [
      { label: 'Usuarios',      href: '/dashboard/usuarios',      icon: '👥', roles: ['admin'], module: 'users' },
      { label: 'Configuración', href: '/dashboard/configuracion', icon: '⚙️', roles: ['admin'], module: 'dashboard' },
    ],
  },
]

export default function Sidebar({ user, open, onToggle, mobile }: {
  user:     any
  open:     boolean
  onToggle: () => void
  mobile:   boolean
}) {
  const pathname                          = usePathname()
  const [settings, setSettings]           = useState<any>(null)
  const [openGroups, setOpenGroups]       = useState<string[]>(['Ventas', 'Inventario'])
  const [activeModules, setActiveModules] = useState<string[]>([
    'pos', 'inventory', 'dashboard', 'suppliers', 'purchases',
    'customers', 'debts', 'bread', 'containers', 'reports', 'cash', 'users',
  ])
  const collapsed = !open

  useEffect(() => {
    fetch(`/api/settings?tenantId=${user.tenantId}`)
      .then(r => r.json())
      .then(data => setSettings(data))

    fetch(`/api/tenant-modules?tenantId=${user.tenantId}&all=true`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActiveModules(data) })
  }, [user.tenantId])

  useEffect(() => {
    NAV.forEach(item => {
      if (item.type === 'group') {
        const hasActive = item.children?.some((c: any) => c.href === pathname)
        if (hasActive && !openGroups.includes(item.label)) {
          setOpenGroups(prev => [...prev, item.label])
        }
      }
    })
  }, [pathname])

  function toggleGroup(label: string) {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    )
  }

  const filteredNav = NAV
    .filter(item => item.roles.some(r => r === user.role))
    .map(item => {
      if (item.type === 'group') {
        return {
          ...item,
          children: item.children?.filter((c: any) =>
            c.roles.includes(user.role) && activeModules.includes(c.module)
          ),
        }
      }
      return item
    })
    .filter(item =>
      item.type === 'link'
        ? activeModules.includes((item as any).module)
        : (item as any).children?.length > 0
    )

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

      {/* Header */}
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
              <img src={settings.logoUrl} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 2, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--bg)' }}>V</div>
            )}
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {settings?.businessName ?? 'Vexor'}
            </span>
          </div>
        )}
        {collapsed && (
          settings?.logoUrl
            ? <img src={settings.logoUrl} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 2 }} />
            : <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--bg)' }}>V</div>
        )}
        <button onClick={onToggle} style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{user.name}</p>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(14,165,233,0.1)', color: 'var(--cyan)', display: 'inline-block', marginTop: 4 }}>
            {user.role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        {filteredNav.map(item => {

          if (item.type === 'link') {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href!} title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px' : '8px 10px',
                  borderRadius: 8, marginBottom: 2,
                  textDecoration: 'none',
                  background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                  color: active ? 'var(--cyan)' : 'var(--muted)',
                  fontSize: 14, fontWeight: active ? 500 : 400,
                  transition: 'background .15s, color .15s',
                }}
              >
                <span style={{ fontSize: collapsed ? 20 : 16 }}>{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            )
          }

          if (item.type === 'group') {
            const filteredChildren = (item as any).children ?? []
            if (filteredChildren.length === 0) return null

            const isOpen    = openGroups.includes(item.label)
            const hasActive = filteredChildren.some((c: any) => c.href === pathname)

            return (
              <div key={item.label} style={{ marginBottom: 2 }}>
                {!collapsed ? (
                  <button onClick={() => toggleGroup(item.label)} style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 8,
                    background: hasActive ? 'rgba(14,165,233,0.06)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: hasActive ? 'var(--cyan)' : 'var(--muted)',
                    fontSize: 13, fontWeight: hasActive ? 600 : 500,
                    transition: 'background .15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      {item.label}
                    </div>
                    <span style={{ fontSize: 10, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
                  </button>
                ) : (
                  <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }} title={item.label}>
                    <span style={{ fontSize: 20, color: hasActive ? 'var(--cyan)' : 'var(--muted)' }}>{item.icon}</span>
                  </div>
                )}

                {(isOpen || collapsed) && (
                  <div style={{ marginLeft: collapsed ? 0 : 12 }}>
                    {filteredChildren.map((child: any) => {
                      const active = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href} title={collapsed ? child.label : undefined}
                          style={{
                            display: 'flex', alignItems: 'center',
                            gap: collapsed ? 0 : 8,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            padding: collapsed ? '8px' : '7px 10px',
                            borderRadius: 8, marginBottom: 1,
                            textDecoration: 'none',
                            background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                            color: active ? 'var(--cyan)' : 'var(--muted)',
                            fontSize: 13, fontWeight: active ? 500 : 400,
                            transition: 'background .15s, color .15s',
                            borderLeft: collapsed ? 'none' : `2px solid ${active ? 'var(--cyan)' : 'var(--border)'}`,
                          }}
                        >
                          <span style={{ fontSize: collapsed ? 18 : 14 }}>{child.icon}</span>
                          {!collapsed && child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return null
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && <ThemeToggle />}
        {collapsed && (
          <button onClick={() => {
            const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
            document.documentElement.setAttribute('data-theme', next)
            localStorage.setItem('vexor-theme', next)
          }} title="Cambiar tema" style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 16, marginBottom: 8 }}>
            🌙
          </button>
        )}
        <button onClick={() => signOut({ callbackUrl: '/login' })} title={collapsed ? 'Cerrar sesión' : undefined}
          style={{ width: '100%', padding: collapsed ? '9px' : '9px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: collapsed ? 16 : 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 8, transition: 'border-color .15s, color .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          {collapsed ? '🚪' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}
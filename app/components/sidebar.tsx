/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import ThemeToggle from './theme-toggle'
import GlobalSearch from './global-search'
import Badge from './ui/badge'

type Role = 'admin' | 'cajero' | 'bodeguero'
type IconName =
  | 'chart'
  | 'sale'
  | 'cash'
  | 'debt'
  | 'customer'
  | 'receipt'
  | 'box'
  | 'truck'
  | 'bread'
  | 'bottle'
  | 'settings'
  | 'users'
  | 'search'
  | 'logout'
  | 'chevron'
  | 'menu'
  | 'sun'
  | 'moon'

type NavLink = {
  type: 'link'
  label: string
  href: string
  icon: IconName
  roles: Role[]
  module: string
}

type NavGroup = {
  type: 'group'
  label: string
  icon: IconName
  roles: Role[]
  children: Array<Omit<NavLink, 'type'>>
}

type NavItem = NavLink | NavGroup

const NAV: NavItem[] = [
  {
    type: 'link', label: 'Inicio', href: '/dashboard',
    icon: 'chart', roles: ['admin', 'cajero', 'bodeguero'], module: 'dashboard',
  },
  {
    type: 'group', label: 'Ventas', icon: 'sale',
    roles: ['admin', 'cajero'],
    children: [
      { label: 'Punto de venta', href: '/dashboard/pos', icon: 'sale', roles: ['admin', 'cajero'], module: 'pos' },
      { label: 'Caja', href: '/dashboard/caja', icon: 'cash', roles: ['admin', 'cajero'], module: 'cash' },
      { label: 'Deudas', href: '/dashboard/deudas', icon: 'debt', roles: ['admin', 'cajero'], module: 'debts' },
      { label: 'Clientes', href: '/dashboard/clientes', icon: 'customer', roles: ['admin', 'cajero'], module: 'customers' },
      { label: 'Boleta SII', href: '/dashboard/sii', icon: 'receipt', roles: ['admin'], module: 'sii' },
    ],
  },
  {
    type: 'group', label: 'Inventario', icon: 'box',
    roles: ['admin', 'bodeguero'],
    children: [
      { label: 'Productos', href: '/dashboard/inventario', icon: 'box', roles: ['admin', 'bodeguero'], module: 'inventory' },
      { label: 'Compras', href: '/dashboard/compras', icon: 'receipt', roles: ['admin', 'bodeguero'], module: 'purchases' },
      { label: 'Proveedores', href: '/dashboard/proveedores', icon: 'truck', roles: ['admin'], module: 'suppliers' },
    ],
  },
  {
    type: 'group', label: 'Operaciones', icon: 'truck',
    roles: ['admin', 'bodeguero', 'cajero'],
    children: [
      { label: 'Pan', href: '/dashboard/pan', icon: 'bread', roles: ['admin', 'bodeguero'], module: 'bread' },
      { label: 'Envases', href: '/dashboard/envases', icon: 'bottle', roles: ['admin', 'cajero'], module: 'containers' },
    ],
  },
  {
    type: 'group', label: 'Analisis', icon: 'chart',
    roles: ['admin'],
    children: [
      { label: 'Reportes', href: '/dashboard/reportes', icon: 'chart', roles: ['admin'], module: 'reports' },
    ],
  },
  {
    type: 'group', label: 'Administracion', icon: 'settings',
    roles: ['admin'],
    children: [
      { label: 'Usuarios', href: '/dashboard/usuarios', icon: 'users', roles: ['admin'], module: 'users' },
      { label: 'Configuracion', href: '/dashboard/configuracion', icon: 'settings', roles: ['admin'], module: 'dashboard' },
    ],
  },
]

function SidebarIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  const paths: Record<IconName, ReactNode> = {
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5" /><path d="M12 16V8" /><path d="M16 16v-3" /></>,
    sale: <><path d="M6 7h12l-1 11H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /><path d="M9 13h6" /></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.4" /><path d="M6 9h.01M18 15h.01" /></>,
    debt: <><path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    customer: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    receipt: <><path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    box: <><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    bread: <><path d="M5 11c0-4 3-7 7-7s7 3 7 7v7H5v-7Z" /><path d="M9 8v3M13 7v4M17 9v2" /></>,
    bottle: <><path d="M10 3h4v4l2 3v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-9l2-3V3Z" /><path d="M10 7h4M8 13h8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.3 3h-4.6l-.3 2.9A7 7 0 0 0 7.5 7L5.1 6l-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.9 1.1l.3 2.9h4.6l.3-2.9a7 7 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1.1Z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 11a3 3 0 0 0 0-6" /><path d="M17 20a5 5 0 0 0-3-4.6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M14 4h5v16h-5" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z" />,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function LogoMark({ logoUrl, collapsed }: { logoUrl?: string | null; collapsed: boolean }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="Logo del negocio" className="sidebar-logo-img" />
  }

  return (
    <div className={`sidebar-logo-mark ${collapsed ? 'is-collapsed' : ''}`}>
      V
    </div>
  )
}

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar({ user, open, onToggle, mobile, onNavigate }: {
  user:     any
  open:     boolean
  onToggle: () => void
  mobile:   boolean
  onNavigate?: () => void
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

  const filteredNav = useMemo(() => {
    return NAV
      .filter(item => item.roles.some(r => r === user.role))
      .map(item => {
        if (item.type === 'group') {
          return {
            ...item,
            children: item.children.filter((c) =>
              c.roles.includes(user.role) && activeModules.includes(c.module)
            ),
          }
        }
        return item
      })
      .filter(item =>
        item.type === 'link'
          ? activeModules.includes(item.module)
          : item.children.length > 0
      )
  }, [activeModules, user.role])

  const activeGroupLabels = useMemo(() => (
    filteredNav
      .filter((item): item is NavGroup => item.type === 'group')
      .filter(item => item.children.some(c => isActivePath(pathname, c.href)))
      .map(item => item.label)
  ), [filteredNav, pathname])

  function toggleGroup(label: string) {
    setOpenGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    )
  }

  const businessName = settings?.businessName ?? 'Vexor'

  return (
    <aside
      className={`sidebar-shell ${collapsed ? 'is-collapsed' : ''} ${mobile ? 'is-mobile' : ''}`}
      aria-label="Navegacion principal"
      data-open={open}
    >
      <style>{`
        .sidebar-shell {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 50;
          width: 252px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          background: color-mix(in srgb, var(--bg2) 92%, var(--surface));
          transition: width .22s ease, transform .22s ease;
          overflow: hidden;
        }

        .sidebar-shell.is-collapsed { width: 68px; }
        .sidebar-shell.is-mobile[data-open="false"] { transform: translateX(-100%); }
        .sidebar-shell.is-mobile[data-open="true"] { width: min(312px, 88vw); }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 68px;
          padding: 14px 14px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .sidebar-logo-mark,
        .sidebar-logo-img {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .sidebar-logo-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--cyan);
          color: var(--bg);
          font-family: var(--font-display), var(--font-body), sans-serif;
          font-size: 14px;
          font-weight: 900;
        }

        .sidebar-logo-img {
          object-fit: contain;
          background: #fff;
          padding: 3px;
        }

        .sidebar-brand-copy {
          min-width: 0;
        }

        .sidebar-brand-title {
          overflow: hidden;
          color: var(--text);
          font-family: var(--font-display), var(--font-body), sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-brand-subtitle {
          margin-top: 2px;
          color: var(--muted);
          font-size: 11px;
        }

        .sidebar-icon-button {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: color var(--ease-standard), border-color var(--ease-standard), background var(--ease-standard);
        }

        .sidebar-toggle-expanded svg {
          transition: transform .18s ease;
        }

        .sidebar-shell:not(.is-collapsed) .sidebar-toggle-expanded svg {
          transform: rotate(90deg);
        }

        .sidebar-icon-button:hover {
          border-color: var(--border-h);
          color: var(--cyan-l);
          background: rgba(14,165,233,0.07);
        }

        .sidebar-search {
          padding: 10px 10px 4px;
        }

        .sidebar-nav {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 8px;
        }

        .sidebar-group {
          margin-bottom: 10px;
        }

        .sidebar-group-button,
        .sidebar-link {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 36px;
          padding: 8px 10px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          line-height: 1;
          text-decoration: none;
          cursor: pointer;
          transition: color var(--ease-standard), background var(--ease-standard);
        }

        .sidebar-group-button {
          justify-content: space-between;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .sidebar-group-label {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
        }

        .sidebar-link {
          margin: 2px 0;
          font-weight: 650;
        }

        .sidebar-link:hover,
        .sidebar-group-button:hover {
          background: rgba(14,165,233,0.06);
          color: var(--text);
        }

        .sidebar-link.is-active {
          background: rgba(14,165,233,0.12);
          color: var(--text);
        }

        .sidebar-link.is-active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 0 999px 999px 0;
          background: var(--cyan-l);
        }

        .sidebar-group-button.is-active {
          color: var(--cyan-l);
        }

        .sidebar-children {
          margin-top: 3px;
          padding-left: 10px;
          border-left: 1px solid var(--border);
        }

        .sidebar-shell.is-collapsed .sidebar-header {
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          min-height: 112px;
          padding: 14px 8px;
        }

        .sidebar-shell.is-collapsed .sidebar-brand {
          justify-content: center;
          flex: 0 0 auto;
        }

        .sidebar-shell.is-collapsed .sidebar-brand-copy,
        .sidebar-shell.is-collapsed .sidebar-link-text,
        .sidebar-shell.is-collapsed .sidebar-group-text,
        .sidebar-shell.is-collapsed .sidebar-chevron,
        .sidebar-shell.is-collapsed .sidebar-account-copy {
          display: none;
        }

        .sidebar-shell.is-collapsed .sidebar-toggle-expanded {
          display: inline-flex;
          width: 34px;
          height: 28px;
          flex-shrink: 0;
        }

        .sidebar-shell.is-collapsed .sidebar-toggle-expanded svg {
          transform: rotate(-90deg);
        }

        .sidebar-shell.is-collapsed .sidebar-search {
          padding: 8px;
        }

        .sidebar-shell.is-collapsed .sidebar-group {
          margin-bottom: 4px;
        }

        .sidebar-shell.is-collapsed .sidebar-group-button,
        .sidebar-shell.is-collapsed .sidebar-link {
          justify-content: center;
          padding: 9px;
        }

        .sidebar-shell.is-collapsed .sidebar-children {
          padding-left: 0;
          border-left: 0;
        }

        .sidebar-tip {
          position: relative;
        }

        .sidebar-shell.is-collapsed .sidebar-tip::after {
          content: attr(data-tooltip);
          position: fixed;
          left: 74px;
          z-index: 200;
          width: max-content;
          max-width: 220px;
          padding: 6px 9px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 12px 30px rgba(0,0,0,.25);
          font-size: 12px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(-2px);
          transition: opacity var(--ease-standard), transform var(--ease-standard);
        }

        .sidebar-shell.is-collapsed .sidebar-tip:hover::after,
        .sidebar-shell.is-collapsed .sidebar-tip:focus-visible::after {
          opacity: 1;
          transform: translateY(0);
        }

        .sidebar-footer {
          padding: 10px;
          padding-bottom: 18px;
          border-top: 1px solid var(--border);
        }

        .sidebar-account {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          margin-bottom: 8px;
        }

        .sidebar-avatar {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(14,165,233,0.12);
          color: var(--cyan-l);
          font-weight: 900;
        }

        .sidebar-account-name {
          color: var(--text);
          font-size: 12px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-footer-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-logout {
          justify-content: flex-start;
          width: 100%;
        }

        .sidebar-shell.is-collapsed .sidebar-account {
          justify-content: center;
          padding: 8px;
        }

        .sidebar-shell.is-collapsed .sidebar-footer-actions {
          align-items: stretch;
        }

        .sidebar-shell.is-collapsed .sidebar-logout {
          justify-content: center;
          padding: 9px;
        }
      `}</style>

      <div className="sidebar-header">
        <div className="sidebar-brand">
          <LogoMark logoUrl={settings?.logoUrl} collapsed={collapsed} />
          <div className="sidebar-brand-copy">
            <p className="sidebar-brand-title">{businessName}</p>
            <p className="sidebar-brand-subtitle">Gestion del negocio</p>
          </div>
        </div>
        <button
          aria-label={collapsed ? 'Expandir navegacion' : 'Colapsar navegacion'}
          className="sidebar-icon-button sidebar-toggle-expanded"
          onClick={onToggle}
          type="button"
        >
          <SidebarIcon name="chevron" size={17} />
        </button>
      </div>

      <div className="sidebar-search">
        <GlobalSearch tenantId={user.tenantId} collapsed={collapsed} />
      </div>

      <nav className="sidebar-nav" aria-label="Modulos de Vexor">
        {filteredNav.map((item) => {
          if (item.type === 'link') {
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={`sidebar-link sidebar-tip ${active ? 'is-active' : ''}`}
                data-tooltip={item.label}
                href={item.href}
                key={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
              >
                <SidebarIcon name={item.icon} />
                <span className="sidebar-link-text">{item.label}</span>
              </Link>
            )
          }

          const isOpen = openGroups.includes(item.label) || activeGroupLabels.includes(item.label)
          const hasActive = item.children.some(c => isActivePath(pathname, c.href))

          return (
            <div className="sidebar-group" key={item.label}>
              <button
                aria-expanded={isOpen || collapsed}
                className={`sidebar-group-button sidebar-tip ${hasActive ? 'is-active' : ''}`}
                data-tooltip={item.label}
                onClick={() => toggleGroup(item.label)}
                title={collapsed ? item.label : undefined}
                type="button"
              >
                <span className="sidebar-group-label">
                  <SidebarIcon name={item.icon} />
                  <span className="sidebar-group-text">{item.label}</span>
                </span>
                <span className="sidebar-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <SidebarIcon name="chevron" size={14} />
                </span>
              </button>

              {(isOpen || collapsed) && (
                <div className="sidebar-children">
                  {item.children.map(child => {
                    const active = isActivePath(pathname, child.href)
                    return (
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={`sidebar-link sidebar-tip ${active ? 'is-active' : ''}`}
                        data-tooltip={child.label}
                        href={child.href}
                        key={child.href}
                        onClick={onNavigate}
                        title={collapsed ? child.label : undefined}
                      >
                        <SidebarIcon name={child.icon} />
                        <span className="sidebar-link-text">{child.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-account sidebar-tip" data-tooltip={`${user.name} · ${user.role}`}>
          <div className="sidebar-avatar" aria-hidden="true">
            {String(user.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-account-copy">
            <p className="sidebar-account-name">{user.name}</p>
            <Badge variant="info">{user.role}</Badge>
          </div>
        </div>
        <div className="sidebar-footer-actions">
          <ThemeToggle collapsed={collapsed} />
          <button
            aria-label="Cerrar sesion"
            className="v-btn v-btn--ghost sidebar-logout sidebar-tip"
            data-tooltip="Cerrar sesion"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title={collapsed ? 'Cerrar sesion' : undefined}
            type="button"
          >
            <SidebarIcon name="logout" />
            {!collapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

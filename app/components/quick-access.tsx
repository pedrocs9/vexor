'use client'

import Link from 'next/link'

const ITEMS = [
  { label: 'Punto de venta', href: '/dashboard/pos',        icon: '💰', color: 'var(--cyan)' },
  { label: 'Inventario',     href: '/dashboard/inventario', icon: '📦', color: 'var(--success)' },
  { label: 'Reportes',       href: '/dashboard/reportes',   icon: '📈', color: 'var(--warning)' },
  { label: 'Proveedores',    href: '/dashboard/proveedores',icon: '🚚', color: 'var(--muted)' },
]

export default function QuickAccess() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 15, fontWeight: 600,
        color: 'var(--text)', marginBottom: 16,
      }}>
        Accesos rápidos
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="quick-link" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--border)',
            textDecoration: 'none',
            background: 'var(--bg2)',
            transition: 'border-color .15s, transform .1s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = item.color
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
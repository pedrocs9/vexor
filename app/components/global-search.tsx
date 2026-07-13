/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Badge from './ui/badge'

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width={size}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function SearchModal({ query, setQuery, results, loading, open, onClose }: any) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [])

  function handleSelect(type: string) {
    onClose()
    if (type === 'product')  router.push('/dashboard/inventario')
    if (type === 'customer') router.push('/dashboard/clientes')
  }

  const total = (results.products?.length ?? 0) + (results.customers?.length ?? 0)

  return createPortal(
    <div
      aria-label="Busqueda global"
      aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh', paddingLeft: 16, paddingRight: 16,
      }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-h)',
        borderRadius: 16, width: '100%', maxWidth: 580,
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: query.length >= 2 ? '1px solid var(--border)' : 'none',
        }}>
          <span style={{ color: loading ? 'var(--warning)' : 'var(--cyan-l)', flexShrink: 0 }}>
            <SearchIcon size={20} />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos o clientes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--text)', fontSize: 17,
              outline: 'none', fontFamily: 'var(--font-body)',
            }}
          />
          <button onClick={onClose} className="v-btn v-btn--ghost" style={{
            minHeight: 28,
            fontSize: 11,
            padding: '3px 8px',
            flexShrink: 0,
          }}>
            ESC
          </button>
        </div>

        {open && total === 0 && !loading && query.length >= 2 && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 6 }}>
              Sin resultados para &ldquo;{query}&rdquo;
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', opacity: .7 }}>
              Intenta con otro nombre, SKU o telefono
            </p>
          </div>
        )}

        {open && total > 0 && (
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {results.products?.length > 0 && (
              <>
                <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Productos
                </div>
                {results.products.map((p: any) => (
                  <button key={p.id} onClick={() => handleSelect('product')} style={{
                    width: '100%', padding: '10px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', transition: 'background .1s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        ${Number(p.price).toLocaleString('es-CL')} - Stock: {Number(p.stock)} {p.unit}
                        {p.sku && ` - SKU: ${p.sku}`}
                      </p>
                    </div>
                    <Badge variant={Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0 ? 'danger' : 'info'}>
                      {Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0 ? 'Stock bajo' : 'Producto'}
                    </Badge>
                  </button>
                ))}
              </>
            )}

            {results.customers?.length > 0 && (
              <>
                <div style={{
                  padding: '12px 20px 6px', fontSize: 11, fontWeight: 800,
                  color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em',
                  borderTop: results.products?.length > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  Clientes
                </div>
                {results.customers.map((c: any) => (
                  <button key={c.id} onClick={() => handleSelect('customer')} style={{
                    width: '100%', padding: '10px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', transition: 'background .1s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.07)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(14,165,233,0.14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, color: 'var(--cyan-l)',
                    }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {c.phone ?? 'Sin telefono'}{c.rut && ` - ${c.rut}`}
                      </p>
                    </div>
                    <Badge variant="success">Cliente</Badge>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, alignItems: 'center' }}>
          {[['Enter', 'Ir a la seccion'], ['ESC', 'Cerrar'], ['Ctrl K', 'Abrir']].map(([key, label]) => (
            <span key={key} style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'monospace' }}>
                {key}
              </kbd>
              {label}
            </span>
          ))}
          {total > 0 && (
            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
              {total} resultado{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function GlobalSearch({ tenantId, collapsed }: {
  tenantId: number
  collapsed?: boolean
}) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<any>({ products: [], customers: [] })
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const [showBox, setShowBox] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timer                 = useRef<any>(null)

  const closeSearch = useCallback(() => {
    setShowBox(false)
    setQuery('')
    setResults({ products: [], customers: [] })
    setOpen(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowBox(true)
      }
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeSearch])

  useEffect(() => {
    if (query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({ products: [], customers: [] })
      setOpen(false)
      return
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      const res  = await fetch(`/api/search?tenantId=${tenantId}&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)
  }, [query, tenantId])

  return (
    <>
      {!collapsed ? (
        <button
          aria-label="Abrir busqueda global"
          onClick={() => setShowBox(true)}
          style={{
            width: '100%', padding: '9px 10px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--muted)',
          }}
          type="button"
        >
          <SearchIcon size={15} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>Buscar...</span>
          <kbd style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>Ctrl K</kbd>
        </button>
      ) : (
        <button
          aria-label="Buscar"
          className="sidebar-tip"
          data-tooltip="Buscar"
          onClick={() => setShowBox(true)}
          title="Buscar"
          style={{
            width: '100%', height: 38, background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 10,
            cursor: 'pointer', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          type="button"
        >
          <SearchIcon />
        </button>
      )}

      {mounted && showBox && (
        <SearchModal
          query={query}
          setQuery={setQuery}
          results={results}
          loading={loading}
          open={open}
          onClose={closeSearch}
        />
      )}
    </>
  )
}

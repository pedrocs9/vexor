/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

function SearchModal({ query, setQuery, results, loading, open, onClose, tenantId }: any) {
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
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
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
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: query.length >= 2 ? '1px solid var(--border)' : 'none',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>
            {loading ? '⏳' : '🔍'}
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos, clientes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--text)', fontSize: 17,
              outline: 'none', fontFamily: 'var(--font-body)',
            }}
          />
          <button onClick={onClose} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--muted)', cursor: 'pointer',
            fontSize: 11, padding: '3px 8px', flexShrink: 0,
          }}>
            ESC
          </button>
        </div>

        {/* Sin resultados */}
        {open && total === 0 && !loading && query.length >= 2 && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 6 }}>
              Sin resultados para &ldquo;{query}&rdquo;
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', opacity: .6 }}>
              Intenta con otro nombre, SKU o teléfono
            </p>
          </div>
        )}

        {/* Resultados */}
        {open && total > 0 && (
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {results.products?.length > 0 && (
              <>
                <div style={{ padding: '12px 20px 6px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  📦 Productos
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
                      : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📦</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        ${Number(p.price).toLocaleString('es-CL')} · Stock: {Number(p.stock)} {p.unit}
                        {p.sku && ` · SKU: ${p.sku}`}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 100, flexShrink: 0,
                      background: Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0
                        ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)',
                      color: Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0
                        ? 'var(--danger)' : 'var(--cyan)',
                    }}>
                      {Number(p.stock) <= Number(p.minStock) && Number(p.minStock) > 0 ? 'Stock bajo' : 'Producto'}
                    </span>
                  </button>
                ))}
              </>
            )}

            {results.customers?.length > 0 && (
              <>
                <div style={{
                  padding: '12px 20px 6px', fontSize: 11, fontWeight: 600,
                  color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em',
                  borderTop: results.products?.length > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  👤 Clientes
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
                      width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--cyan), #0369a1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: '#fff',
                    }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {c.phone ?? 'Sin teléfono'}{c.rut && ` · ${c.rut}`}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, flexShrink: 0, background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                      Cliente
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, alignItems: 'center' }}>
          {[['↵', 'Ir a la sección'], ['ESC', 'Cerrar'], ['⌘K', 'Abrir']].map(([key, label]) => (
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowBox(true)
      }
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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

  function closeSearch() {
    setShowBox(false)
    setQuery('')
    setResults({ products: [], customers: [] })
    setOpen(false)
  }

  return (
    <>
      {!collapsed ? (
        <button onClick={() => setShowBox(true)} style={{
          width: '100%', padding: '8px 10px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8,
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <span style={{ fontSize: 13 }}>🔍</span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, color: 'var(--muted)' }}>Buscar...</span>
          <kbd style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd>
        </button>
      ) : (
        <button onClick={() => setShowBox(true)} title="Buscar (⌘K)" style={{
          width: '100%', padding: '9px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 8,
          cursor: 'pointer', fontSize: 16, marginBottom: 8,
        }}>
          🔍
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
          tenantId={tenantId}
        />
      )}
    </>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { notify } from './toast'
import Button from './ui/button'

export default function ImportProducts({ tenantId, onDone }: {
  tenantId: number
  onDone:   () => void
}) {
  const [step, setStep]         = useState<'upload' | 'preview' | 'done'>('upload')
  const [rows, setRows]         = useState<any[]>([])
  const [errors, setErrors]     = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<any>(null)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const REQUIRED = ['nombre', 'precio']
  const COLUMNS  = ['nombre', 'sku', 'codigo', 'precio', 'costo', 'stock', 'stock_minimo', 'unidad', 'categoria']

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header:    true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.toLowerCase().trim().replace(/ /g, '_'),
      complete: (results: any) => {
        const errs: string[] = []
        const valid: any[]   = []

        results.data.forEach((row: any, i: number) => {
          const missing = REQUIRED.filter(f => !row[f] || row[f].toString().trim() === '')
          if (missing.length > 0) {
            errs.push(`Fila ${i + 2}: faltan campos obligatorios (${missing.join(', ')})`)
          } else {
            valid.push({
              nombre:        row.nombre?.trim(),
              sku:           row.sku?.trim()           || null,
              codigo:        row.codigo?.trim()        || null,
              precio:        Number(row.precio),
              costo:         row.costo   ? Number(row.costo)   : null,
              stock:         row.stock   ? Number(row.stock)   : 0,
              stock_minimo:  row.stock_minimo ? Number(row.stock_minimo) : 0,
              unidad:        row.unidad?.trim()        || 'un',
              categoria:     row.categoria?.trim()     || null,
            })
          }
        })

        setRows(valid)
        setErrors(errs)
        setStep('preview')
      },
      error: () => setErrors(['Error al leer el archivo. Verifica que sea un CSV válido.']),
    })
  }

  async function handleImport() {
    setLoading(true)
    const res  = await fetch('/api/products/import', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tenantId, rows }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
    setStep('done')
    if (data.errors > 0) {
      notify.warning(`${data.imported} productos importados, ${data.errors} con error`)
    } else {
      notify.success(`${data.imported} productos importados correctamente`)
    }
  }

  const inputStyle: any = {
    padding: '10px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)',
    fontSize: 14, outline: 'none', width: '100%',
  }

  return (
    <div>
      {step === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Instrucciones */}
          <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
              Formato del CSV
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              El archivo debe tener las siguientes columnas en la primera fila:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {COLUMNS.map(col => (
                <span key={col} style={{
                  fontSize: 12, padding: '3px 10px', borderRadius: 100,
                  background: REQUIRED.includes(col) ? 'rgba(14,165,233,0.1)' : 'var(--surface)',
                  color: REQUIRED.includes(col) ? 'var(--cyan)' : 'var(--muted)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  {col}{REQUIRED.includes(col) ? ' *' : ''}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
              * Campos obligatorios. Las columnas pueden estar en cualquier orden.
            </p>
          </div>

          {/* Ejemplo */}
          <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Ejemplo:</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    {['nombre', 'precio', 'costo', 'stock', 'unidad', 'categoria', 'sku'].map(h => (
                      <th key={h} style={{ padding: '6px 12px', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Coca Cola 1.5L', '1500', '1100', '24', 'un', 'Bebidas', 'CC-15'],
                    ['Azúcar 1kg', '900', '700', '50', 'kg', 'Abarrotes', 'AZ-1K'],
                    ['Detergente Omo', '2500', '1800', '30', 'un', 'Aseo', 'OMO-1'],
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: '6px 12px', color: 'var(--text)', border: '1px solid var(--border)' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload */}
          <div>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={{
              width: '100%', padding: '20px',
              background: 'transparent',
              border: '2px dashed var(--border-h)',
              borderRadius: 12, color: 'var(--cyan)',
              fontFamily: 'var(--font-display)',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              📂 Click para seleccionar archivo CSV
            </button>
          </div>

          {/* Botón descargar plantilla */}
          <button
            onClick={() => {
              const csv = 'nombre,precio,costo,stock,stock_minimo,unidad,categoria,sku,codigo\nCoca Cola 1.5L,1500,1100,24,5,un,Bebidas,CC-15,\nAzúcar 1kg,900,700,50,10,kg,Abarrotes,AZ-1K,'
              const blob = new Blob([csv], { type: 'text/csv' })
              const url  = URL.createObjectURL(blob)
              const a    = document.createElement('a')
              a.href = url; a.download = 'plantilla-productos.csv'; a.click()
            }}
            style={{
              padding: '10px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--muted)', fontSize: 13, cursor: 'pointer',
            }}
          >
            ⬇️ Descargar plantilla CSV
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Resumen */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--success)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Productos válidos</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--success)' }}>{rows.length}</p>
            </div>
            <div style={{ background: errors.length > 0 ? 'rgba(239,68,68,0.08)' : 'var(--surface)', border: `1px solid ${errors.length > 0 ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Filas con error</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: errors.length > 0 ? 'var(--danger)' : 'var(--muted)' }}>{errors.length}</p>
            </div>
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>Filas con errores (serán omitidas):</p>
              {errors.map((err, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 4 }}>• {err}</p>
              ))}
            </div>
          )}

          {/* Preview tabla */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)' }}>
                  {['Nombre', 'Precio', 'Costo', 'Stock', 'Unidad', 'Categoría'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text)', fontWeight: 500 }}>{row.nombre}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--cyan)' }}>${Number(row.precio).toLocaleString('es-CL')}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--muted)' }}>{row.costo ? `$${Number(row.costo).toLocaleString('es-CL')}` : '—'}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--text)' }}>{row.stock} {row.unidad}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--muted)' }}>{row.unidad}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--muted)' }}>{row.categoria ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setStep('upload'); setRows([]); setErrors([]) }} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
              ← Volver
            </button>
            <Button onClick={handleImport} disabled={rows.length === 0} isLoading={loading} loadingText="Importando" variant="primary" style={{ flex: 2 }}>
              Importar {rows.length} productos
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{result.errors === 0 ? '✅' : '⚠️'}</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Importación completada
          </h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            {result.imported} productos importados correctamente
            {result.errors > 0 && ` · ${result.errors} con error`}
          </p>
          <button onClick={onDone} style={{ padding: '12px 28px', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Ver inventario →
          </button>
        </div>
      )}
    </div>
  )
}

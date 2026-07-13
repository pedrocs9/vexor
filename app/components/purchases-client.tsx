/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import Badge from './ui/badge'
import Button from './ui/button'
import EmptyState from './ui/empty-state'
import Modal from './ui/modal'
import PageHeader from './ui/page-header'
import Surface from './ui/surface'

type InvoiceItem = {
  productId: number | null
  productName: string
  qty: number
  cost: number
  subtotal: number
}

type PurchaseForm = {
  supplierId: string
  invoiceNumber: string
  date: string
  note: string
}

const emptyItem: InvoiceItem = {
  productId: null,
  productName: '',
  qty: 1,
  cost: 0,
  subtotal: 0,
}

function money(value: number | string | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString('es-CL')}`
}

function dateLabel(value: string | Date | null | undefined) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleDateString('es-CL')
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="purchase-label">{children}</label>
}

export default function PurchasesClient({ invoices, suppliers, products, tenantId }: {
  invoices: any[]
  suppliers: any[]
  products: any[]
  tenantId: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [form, setForm] = useState<PurchaseForm>({
    supplierId: '', invoiceNumber: '', date: '', note: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }])
  const [productSearch, setProductSearch] = useState<string[]>([''])
  const [showProductList, setShowProductList] = useState<boolean[]>([false])

  const total = items.reduce((s, i) => s + i.subtotal, 0)

  const summary = useMemo(() => {
    const purchasedTotal = invoices.reduce((s, i) => s + Number(i.total), 0)
    const thisMonth = invoices
      .filter(i => {
        const current = new Date()
        const invoiceDate = new Date(i.date)
        return invoiceDate.getMonth() === current.getMonth() && invoiceDate.getFullYear() === current.getFullYear()
      })
      .reduce((s, i) => s + Number(i.total), 0)
    const productsAdded = invoices.reduce((s, i) => s + (i.items?.length ?? 0), 0)

    return { purchasedTotal, thisMonth, productsAdded }
  }, [invoices])

  function resetForm() {
    setForm({ supplierId: '', invoiceNumber: '', date: '', note: '' })
    setItems([{ ...emptyItem }])
    setProductSearch([''])
    setShowProductList([false])
  }

  function closeForm() {
    if (loading) return
    setShowForm(false)
    resetForm()
  }

  function addItem() {
    setItems([...items, { ...emptyItem }])
    setProductSearch([...productSearch, ''])
    setShowProductList([...showProductList, false])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
    setProductSearch(productSearch.filter((_, i) => i !== index))
    setShowProductList(showProductList.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      const newItem = { ...item, [field]: value }
      if (field === 'qty' || field === 'cost') {
        newItem.subtotal = Number(newItem.qty) * Number(newItem.cost)
      }
      return newItem
    })
    setItems(updated)
  }

  function selectProduct(index: number, product: any) {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      return {
        ...item,
        productId: product.id,
        productName: product.name,
        cost: Number(product.cost ?? 0),
        subtotal: Number(item.qty) * Number(product.cost ?? 0),
      }
    })
    setItems(updated)
    const newSearch = [...productSearch]
    newSearch[index] = product.name
    setProductSearch(newSearch)
    const newShow = [...showProductList]
    newShow[index] = false
    setShowProductList(newShow)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (items.some(i => !i.productName || !i.qty || !i.cost)) return
    setLoading(true)
    await fetch('/api/purchase-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tenantId, items }),
    })
    setLoading(false)
    setShowForm(false)
    resetForm()
    window.location.reload()
  }

  return (
    <div className="purchases-page">
      <style>{`
        .purchases-page { display: flex; flex-direction: column; gap: 18px; }
        .purchase-summary { display: grid; grid-template-columns: 1.15fr 1fr 1fr 1fr; gap: 0; }
        .purchase-summary__item { min-width: 0; padding: 16px 18px; border-right: 1px solid var(--border); }
        .purchase-summary__item:last-child { border-right: 0; }
        .purchase-summary__label, .purchase-label { display: block; margin-bottom: 6px; color: var(--muted); font-size: 12px; font-weight: 700; }
        .purchase-summary__value { color: var(--text); font-family: var(--font-display), var(--font-body), sans-serif; font-size: 22px; font-weight: 800; line-height: 1.15; }
        .purchase-summary__value.is-money { color: var(--warning); }
        .purchase-summary__hint { margin-top: 4px; color: var(--muted); font-size: 12px; }
        .purchase-table-wrap { overflow-x: auto; }
        .purchase-table { width: 100%; min-width: 760px; border-collapse: collapse; }
        .purchase-table th { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--muted); font-size: 12px; font-weight: 800; letter-spacing: .06em; text-align: left; text-transform: uppercase; }
        .purchase-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); color: var(--muted); font-size: 13px; vertical-align: middle; }
        .purchase-table tr:last-child td { border-bottom: 0; }
        .purchase-main-cell { display: flex; flex-direction: column; gap: 4px; }
        .purchase-main-cell strong, .purchase-mobile-card strong, .purchase-detail-row strong, .purchase-detail-item strong { color: var(--text); font-size: 14px; font-weight: 800; }
        .purchase-muted { color: var(--muted); font-size: 12px; }
        .purchase-total { color: var(--warning); font-family: var(--font-display), var(--font-body), sans-serif; font-size: 16px; font-weight: 800; }
        .purchase-mobile-list { display: none; }
        .purchase-mobile-card { display: grid; gap: 10px; padding: 14px; border-bottom: 1px solid var(--border); }
        .purchase-mobile-card:last-child { border-bottom: 0; }
        .purchase-mobile-row, .purchase-detail-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .purchase-modal-form { display: flex; flex-direction: column; gap: 16px; }
        .purchase-section { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: color-mix(in srgb, var(--bg2) 70%, transparent); }
        .purchase-section__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        .purchase-section__title { color: var(--text); font-family: var(--font-display), var(--font-body), sans-serif; font-size: 15px; font-weight: 800; }
        .purchase-section__description { margin-top: 3px; color: var(--muted); font-size: 12px; line-height: 1.5; }
        .purchase-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .purchase-input, .purchase-select, .purchase-readonly { width: 100%; min-height: var(--control-h); padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg); color: var(--text); font: inherit; font-size: 14px; outline: none; }
        .purchase-input:focus, .purchase-select:focus { border-color: var(--cyan); box-shadow: var(--focus-ring); }
        .purchase-readonly { display: flex; align-items: center; color: var(--muted); background: var(--surface); }
        .purchase-items { display: flex; flex-direction: column; gap: 10px; }
        .purchase-item { padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); }
        .purchase-item__grid { display: grid; grid-template-columns: minmax(220px, 2fr) minmax(90px, .75fr) minmax(110px, .9fr) minmax(120px, .9fr) 42px; gap: 10px; align-items: end; }
        .purchase-product-search { position: relative; }
        .purchase-product-list { position: absolute; inset: calc(100% + 4px) 0 auto 0; z-index: 60; max-height: 190px; overflow-y: auto; border: 1px solid var(--border-h); border-radius: var(--radius-md); background: var(--surface); box-shadow: 0 16px 38px rgba(0,0,0,.26); }
        .purchase-product-option { width: 100%; padding: 9px 12px; border: 0; border-bottom: 1px solid var(--border); background: transparent; color: var(--text); cursor: pointer; text-align: left; }
        .purchase-product-option:hover, .purchase-product-option:focus-visible { background: rgba(14,165,233,.08); outline: none; }
        .purchase-stock-note { padding: 12px 14px; border: 1px solid rgba(14,165,233,.24); border-radius: var(--radius-md); background: rgba(14,165,233,.08); color: var(--text); font-size: 13px; line-height: 1.5; }
        .purchase-total-panel { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg2); }
        .purchase-total-panel strong { color: var(--cyan-l); font-family: var(--font-display), var(--font-body), sans-serif; font-size: 26px; line-height: 1; }
        .purchase-modal-footer { display: flex; justify-content: flex-end; gap: 10px; width: 100%; }
        .purchase-detail-list { display: flex; flex-direction: column; gap: 8px; }
        .purchase-detail-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 11px 13px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg2); }
        @media (max-width: 980px) {
          .purchase-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .purchase-summary__item { border-right: 0; border-bottom: 1px solid var(--border); }
          .purchase-summary__item:nth-last-child(-n + 2) { border-bottom: 0; }
          .purchase-item__grid { grid-template-columns: minmax(0, 1fr) minmax(90px, .7fr) minmax(110px, .8fr); }
          .purchase-item__grid > :nth-child(4) { grid-column: span 2; }
        }
        @media (max-width: 720px) {
          .purchase-table-wrap { display: none; }
          .purchase-mobile-list { display: block; }
          .purchase-summary, .purchase-form-grid, .purchase-total-panel { grid-template-columns: 1fr; }
          .purchase-summary__item { border-right: 0; border-bottom: 1px solid var(--border); }
          .purchase-summary__item:last-child { border-bottom: 0; }
          .purchase-item__grid { grid-template-columns: 1fr; }
          .purchase-modal-footer { flex-direction: column-reverse; }
          .purchase-modal-footer .v-btn { width: 100%; }
        }
      `}</style>

      <PageHeader
        context={`${invoices.length} compras registradas`}
        title="Compras"
        description="Registra facturas de proveedores y revisa los productos que ingresan al inventario. Cada compra confirmada actualiza el stock."
        actions={<Button variant="primary" onClick={() => setShowForm(true)}>Nueva compra</Button>}
      />

      <Surface>
        <div className="purchase-summary">
          <div className="purchase-summary__item">
            <span className="purchase-summary__label">Compras registradas</span>
            <p className="purchase-summary__value">{invoices.length}</p>
            <p className="purchase-summary__hint">Documentos guardados</p>
          </div>
          <div className="purchase-summary__item">
            <span className="purchase-summary__label">Monto total comprado</span>
            <p className="purchase-summary__value is-money">{money(summary.purchasedTotal)}</p>
            <p className="purchase-summary__hint">Segun facturas registradas</p>
          </div>
          <div className="purchase-summary__item">
            <span className="purchase-summary__label">Este mes</span>
            <p className="purchase-summary__value">{money(summary.thisMonth)}</p>
            <p className="purchase-summary__hint">Compras del mes calendario</p>
          </div>
          <div className="purchase-summary__item">
            <span className="purchase-summary__label">Productos incorporados</span>
            <p className="purchase-summary__value">{summary.productsAdded}</p>
            <p className="purchase-summary__hint">Lineas de productos</p>
          </div>
        </div>
      </Surface>

      <Surface>
        {invoices.length === 0 ? (
          <EmptyState
            title="Aun no hay compras registradas"
            description="Registra la primera compra para ingresar productos al inventario y dejar trazabilidad del proveedor, documento y total."
            actions={<Button variant="primary" onClick={() => setShowForm(true)}>Nueva compra</Button>}
          />
        ) : (
          <>
            <div className="purchase-table-wrap">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Documento</th>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const supplier = suppliers.find(s => s.id === inv.supplierId)
                    return (
                      <tr key={inv.id}>
                        <td>
                          <div className="purchase-main-cell">
                            <strong>{supplier?.name ?? 'Sin proveedor'}</strong>
                            <span className="purchase-muted">Factura #{inv.id}</span>
                          </div>
                        </td>
                        <td>{inv.invoiceNumber ?? 'Sin numero'}</td>
                        <td>{dateLabel(inv.date)}</td>
                        <td><Badge variant="info">{inv.items?.length ?? 0} productos</Badge></td>
                        <td><span className="purchase-total">{money(inv.total)}</span></td>
                        <td><Button variant="secondary" onClick={() => setSelectedInvoice(inv)}>Ver detalle</Button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="purchase-mobile-list">
              {invoices.map(inv => {
                const supplier = suppliers.find(s => s.id === inv.supplierId)
                return (
                  <article className="purchase-mobile-card" key={inv.id}>
                    <div className="purchase-mobile-row">
                      <div>
                        <strong>{supplier?.name ?? 'Sin proveedor'}</strong>
                        <p className="purchase-muted">{inv.invoiceNumber ?? 'Sin numero'} - {dateLabel(inv.date)}</p>
                      </div>
                      <span className="purchase-total">{money(inv.total)}</span>
                    </div>
                    <div className="purchase-mobile-row">
                      <Badge variant="info">{inv.items?.length ?? 0} productos</Badge>
                      <Button variant="secondary" onClick={() => setSelectedInvoice(inv)}>Ver detalle</Button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </Surface>

      {showForm && (
        <Modal
          title="Nueva compra"
          description="Completa el documento, proveedor y productos que ingresaran a stock."
          onClose={closeForm}
          size="wide"
          footer={
            <div className="purchase-modal-footer">
              <Button variant="ghost" onClick={closeForm} disabled={loading}>Cancelar</Button>
              <Button variant="primary" type="submit" form="purchase-form" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar y actualizar stock'}
              </Button>
            </div>
          }
        >
          <form id="purchase-form" className="purchase-modal-form" onSubmit={handleSubmit}>
            <section className="purchase-section">
              <div className="purchase-section__head">
                <div>
                  <h3 className="purchase-section__title">Datos del documento</h3>
                  <p className="purchase-section__description">Identifica la factura o documento de compra.</p>
                </div>
              </div>
              <div className="purchase-form-grid">
                <div>
                  <FieldLabel>Proveedor</FieldLabel>
                  <select className="purchase-select" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                    <option value="">Sin proveedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>N. factura</FieldLabel>
                  <input className="purchase-input" value={form.invoiceNumber} placeholder="Ej: 001234" onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Fecha</FieldLabel>
                  <input className="purchase-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Nota</FieldLabel>
                  <input className="purchase-input" value={form.note} placeholder="Opcional" onChange={e => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>
            </section>

            <section className="purchase-section">
              <div className="purchase-section__head">
                <div>
                  <h3 className="purchase-section__title">Productos</h3>
                  <p className="purchase-section__description">Cada linea define cantidad, costo unitario y subtotal.</p>
                </div>
                <Button variant="secondary" onClick={addItem}>Agregar producto</Button>
              </div>

              {items.length === 0 ? (
                <EmptyState
                  title="Sin productos en la compra"
                  description="Agrega al menos un producto para registrar la compra y actualizar stock."
                  actions={<Button variant="secondary" onClick={addItem}>Agregar producto</Button>}
                />
              ) : (
                <div className="purchase-items">
                  {items.map((item, index) => (
                    <div className="purchase-item" key={index}>
                      <div className="purchase-item__grid">
                        <div className="purchase-product-search">
                          <FieldLabel>Producto</FieldLabel>
                          <input
                            className="purchase-input"
                            placeholder="Buscar producto o escribir nuevo..."
                            value={productSearch[index]}
                            onChange={e => {
                              const newSearch = [...productSearch]
                              newSearch[index] = e.target.value
                              setProductSearch(newSearch)
                              const newShow = [...showProductList]
                              newShow[index] = true
                              setShowProductList(newShow)
                              updateItem(index, 'productName', e.target.value)
                            }}
                          />
                          {showProductList[index] && productSearch[index] && (
                            <div className="purchase-product-list">
                              {products
                                .filter(p => p.name.toLowerCase().includes(productSearch[index].toLowerCase()))
                                .slice(0, 6)
                                .map(p => (
                                  <button className="purchase-product-option" key={p.id} type="button" onClick={() => selectProduct(index, p)}>
                                    <strong>{p.name}</strong>
                                    <span className="purchase-muted"> Stock: {Number(p.stock)}</span>
                                  </button>
                                ))}
                              {productSearch[index] && !products.find(p => p.name.toLowerCase() === productSearch[index].toLowerCase()) && (
                                <div style={{ padding: '9px 12px' }}><span className="purchase-muted">Se registrara como producto nuevo</span></div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <FieldLabel>Cantidad</FieldLabel>
                          <input className="purchase-input" type="number" step="0.1" min="0.1" value={item.qty} onChange={e => updateItem(index, 'qty', Number(e.target.value))} />
                        </div>
                        <div>
                          <FieldLabel>Costo unit.</FieldLabel>
                          <input className="purchase-input" type="number" value={item.cost} onChange={e => updateItem(index, 'cost', Number(e.target.value))} />
                        </div>
                        <div>
                          <FieldLabel>Subtotal</FieldLabel>
                          <div className="purchase-readonly">{money(item.subtotal)}</div>
                        </div>
                        <Button aria-label={`Eliminar producto ${index + 1}`} variant="danger" onClick={() => removeItem(index)}>x</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="purchase-stock-note">Esta compra actualizara el stock de los productos incluidos al registrarla.</div>

            <div className="purchase-total-panel">
              <div>
                <p className="purchase-section__title">Resumen de compra</p>
                <p className="purchase-section__description">
                  {items.length} producto{items.length !== 1 ? 's' : ''} en el documento. Revisa cantidades y costos antes de confirmar.
                </p>
              </div>
              <strong>{money(total)}</strong>
            </div>
          </form>
        </Modal>
      )}

      {selectedInvoice && (
        <Modal
          title={`Factura ${selectedInvoice.invoiceNumber ?? `#${selectedInvoice.id}`}`}
          description="Detalle de productos registrados en esta compra."
          onClose={() => setSelectedInvoice(null)}
          size="medium"
        >
          <div className="purchase-section">
            <div className="purchase-detail-row">
              <span className="purchase-muted">Proveedor</span>
              <strong>{suppliers.find(s => s.id === selectedInvoice.supplierId)?.name ?? 'Sin proveedor'}</strong>
            </div>
            <div className="purchase-detail-row">
              <span className="purchase-muted">Fecha</span>
              <strong>{dateLabel(selectedInvoice.date)}</strong>
            </div>
            {selectedInvoice.note && (
              <div className="purchase-detail-row">
                <span className="purchase-muted">Nota</span>
                <strong>{selectedInvoice.note}</strong>
              </div>
            )}
          </div>

          <div className="purchase-detail-list">
            {selectedInvoice.items?.map((item: any, i: number) => (
              <div className="purchase-detail-item" key={i}>
                <div>
                  <strong>{item.productName}</strong>
                  <p className="purchase-muted">{Number(item.qty)} x {money(item.cost)}</p>
                </div>
                <span className="purchase-total">{money(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="purchase-total-panel">
            <span className="purchase-muted">Total compra</span>
            <strong>{money(selectedInvoice.total)}</strong>
          </div>
        </Modal>
      )}
    </div>
  )
}

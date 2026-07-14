/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Badge from './ui/badge'
import Button from './ui/button'
import ConfirmDialog from './ui/confirm-dialog'
import EmptyState from './ui/empty-state'
import Modal from './ui/modal'
import PageHeader from './ui/page-header'
import Surface from './ui/surface'
import { notify } from './toast'

const inputStyle: any = {
  padding: '10px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
}

const labelStyle: any = {
  fontSize: 12,
  color: 'var(--muted)',
  display: 'block',
  marginBottom: 6,
  fontWeight: 650,
}

const paymentLabels: any = {
  cash: 'Efectivo', debit: 'Debito',
  credit: 'Credito', transfer: 'Transferencia', fiado: 'Fiado',
}

function money(value: number) {
  return `$${Number(value).toLocaleString('es-CL')}`
}

function DebtBadge({ amount }: { amount: number }) {
  return amount > 0
    ? <Badge variant="danger">Con deuda</Badge>
    : <Badge variant="success">Sin deuda</Badge>
}

export default function CustomersClient({ customers }: {
  customers: any[]
}) {
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState<any>(null)
  const [detail, setDetail]               = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [editMode, setEditMode]           = useState(false)
  const [editForm, setEditForm]           = useState<any>(null)
  const [editLoading, setEditLoading]     = useState(false)
  const [activeTab, setActiveTab]         = useState<'sales' | 'debts'>('sales')
  const [deleteCustomer, setDeleteCustomer] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.rut && c.rut.includes(search))
  )

  const totalDebt    = customers.reduce((s, c) => s + c.totalDebt, 0)
  const withDebt     = customers.filter(c => c.totalDebt > 0).length
  const totalSales   = customers.reduce((s, c) => s + c.salesCount, 0)
  const hasSearch    = search.trim().length > 0

  async function loadDetail(customer: any) {
    setSelected(customer)
    setLoadingDetail(true)
    setDetail(null)
    setEditMode(false)
    const data = await fetch(`/api/customers/${customer.id}`).then(r => r.json())
    setDetail(data)
    setLoadingDetail(false)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true)
    await fetch(`/api/customers/${selected.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(editForm),
    })
    setEditLoading(false)
    setEditMode(false)
    window.location.reload()
  }

  async function handleDeleteCustomer() {
    if (!deleteCustomer) return
    setDeleteLoading(true)
    const res = await fetch(`/api/customers/${deleteCustomer.id}`, {
      method: 'DELETE',
    })
    const data = await res.json().catch(() => ({}))
    setDeleteLoading(false)

    if (res.ok) {
      notify.success('Cliente eliminado correctamente')
      setDeleteCustomer(null)
      setSelected(null)
      setDetail(null)
      window.location.reload()
    } else {
      notify.error(data?.error || 'No pudimos eliminar el cliente')
    }
  }

  return (
    <div className="v-page customers-page">
      <style>{`
        .customers-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .customer-summary-item {
          padding: 14px 16px;
        }

        .customer-summary-label {
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .customer-summary-value {
          color: var(--text);
          font-family: var(--font-display), var(--font-body), sans-serif;
          font-size: 22px;
          font-weight: 800;
        }

        .customer-summary-value.attention { color: var(--danger); }

        .customers-workbar {
          display: grid;
          grid-template-columns: minmax(260px, 420px) auto;
          gap: 10px;
          align-items: center;
        }

        .customer-result-count {
          color: var(--muted);
          font-size: 13px;
        }

        .customers-table-wrap { overflow-x: auto; }

        .customers-table {
          width: 100%;
          min-width: 920px;
          border-collapse: collapse;
        }

        .customers-table th {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .customers-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
          font-size: 13px;
          vertical-align: middle;
        }

        .customers-table tr:last-child td { border-bottom: 0; }

        .customer-name {
          color: var(--text);
          font-size: 14px;
          font-weight: 800;
          line-height: 1.3;
        }

        .customer-meta {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .customer-money {
          color: var(--text);
          font-weight: 800;
          white-space: nowrap;
        }

        .customer-debt {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }

        .customer-debt strong {
          color: var(--text);
          font-weight: 800;
          white-space: nowrap;
        }

        .customer-debt.danger strong { color: var(--danger); }

        .customers-mobile-list { display: none; }

        .customer-mobile-row {
          padding: 14px;
          border-top: 1px solid var(--border);
        }

        .customer-mobile-row:first-child { border-top: 0; }

        .customer-mobile-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .customer-mobile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .mobile-label {
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
        }

        .mobile-value {
          margin-top: 2px;
          color: var(--text);
          font-size: 13px;
          font-weight: 750;
        }

        .customer-mobile-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .customer-detail-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .customer-detail-card {
          padding: 13px 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg2);
        }

        .customer-detail-card p:first-child {
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .customer-detail-card p:last-child {
          color: var(--text);
          font-family: var(--font-display), var(--font-body), sans-serif;
          font-size: 18px;
          font-weight: 800;
        }

        .customer-edit-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg2);
        }

        .customer-edit-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .customer-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .activity-item {
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg2);
        }

        .activity-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .activity-date {
          color: var(--muted);
          font-size: 13px;
        }

        .activity-total {
          color: var(--text);
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
        }

        .activity-line {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .loading-detail {
          padding: 28px;
          color: var(--muted);
          text-align: center;
        }

        @media (max-width: 1180px) {
          .customers-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .col-last-sale { display: none; }
        }

        @media (max-width: 760px) {
          .customers-summary { grid-template-columns: 1fr 1fr; }
          .customers-workbar { grid-template-columns: 1fr; }
          .customers-table-wrap { display: none; }
          .customers-mobile-list { display: block; }
          .customer-detail-summary { grid-template-columns: 1fr; }
          .customer-edit-grid { grid-template-columns: 1fr; }
          .activity-head { flex-direction: column; }
        }
      `}</style>

      <PageHeader
        context="CRM operativo"
        title="Clientes"
        description={`${customers.length} clientes registrados. Busca contactos, revisa deuda pendiente y consulta actividad asociada.`}
      />

      <section className="customers-summary" aria-label="Resumen de clientes">
        <Surface padded className="customer-summary-item">
          <p className="customer-summary-label">Total clientes</p>
          <p className="customer-summary-value">{customers.length}</p>
        </Surface>
        <Surface padded className="customer-summary-item">
          <p className="customer-summary-label">Clientes con deuda</p>
          <p className={`customer-summary-value ${withDebt > 0 ? 'attention' : ''}`}>{withDebt}</p>
        </Surface>
        <Surface padded className="customer-summary-item">
          <p className="customer-summary-label">Deuda total</p>
          <p className={`customer-summary-value ${totalDebt > 0 ? 'attention' : ''}`}>{money(totalDebt)}</p>
        </Surface>
        <Surface padded className="customer-summary-item">
          <p className="customer-summary-label">Compras asociadas</p>
          <p className="customer-summary-value">{totalSales}</p>
        </Surface>
      </section>

      <Surface padded>
        <div className="customers-workbar">
          <input
            type="text"
            placeholder="Buscar por nombre, telefono o RUT..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
            aria-label="Buscar clientes"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {hasSearch && (
              <Button type="button" variant="ghost" onClick={() => setSearch('')}>
                Limpiar busqueda
              </Button>
            )}
            <span className="customer-result-count">{filtered.length} de {customers.length} clientes</span>
          </div>
        </div>
      </Surface>

      <Surface aria-label="Listado de clientes">
        {filtered.length === 0 ? (
          customers.length === 0 ? (
            <EmptyState
              title="Aun no hay clientes"
              description="Los clientes apareceran aqui cuando se registren desde los flujos existentes del sistema."
            />
          ) : (
            <EmptyState
              title="No hay coincidencias"
              description="No encontramos clientes con esa busqueda. Limpia el texto para volver al listado completo."
              actions={<Button type="button" variant="secondary" onClick={() => setSearch('')}>Limpiar busqueda</Button>}
            />
          )
        ) : (
          <>
            <div className="customers-table-wrap">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Compras</th>
                    <th>Total gastado</th>
                    <th>Deuda</th>
                    <th className="col-last-sale">Ultima compra</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <p className="customer-name">{c.name}</p>
                        <p className="customer-meta">{c.rut ? `RUT: ${c.rut}` : 'Sin RUT registrado'}</p>
                      </td>
                      <td>
                        <p>{c.phone ?? 'Sin telefono'}</p>
                      </td>
                      <td>{c.salesCount}</td>
                      <td><span className="customer-money">{money(c.totalSpent)}</span></td>
                      <td>
                        <div className={`customer-debt ${c.totalDebt > 0 ? 'danger' : ''}`}>
                          <strong>{money(c.totalDebt)}</strong>
                          <DebtBadge amount={c.totalDebt} />
                        </div>
                      </td>
                      <td className="col-last-sale">{c.lastSale ? new Date(c.lastSale).toLocaleDateString('es-CL') : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Button type="button" variant="secondary" onClick={() => loadDetail(c)}>
                            Ver detalle
                          </Button>
                          <Button type="button" variant="danger" onClick={() => setDeleteCustomer(c)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="customers-mobile-list">
              {filtered.map(c => (
                <article key={c.id} className="customer-mobile-row">
                  <div className="customer-mobile-head">
                    <div>
                      <p className="customer-name">{c.name}</p>
                      <p className="customer-meta">{c.phone ?? 'Sin telefono'}{c.rut ? ` · RUT: ${c.rut}` : ''}</p>
                    </div>
                    <DebtBadge amount={c.totalDebt} />
                  </div>
                  <div className="customer-mobile-grid">
                    <div>
                      <p className="mobile-label">Compras</p>
                      <p className="mobile-value">{c.salesCount}</p>
                    </div>
                    <div>
                      <p className="mobile-label">Deuda</p>
                      <p className="mobile-value">{money(c.totalDebt)}</p>
                    </div>
                    <div>
                      <p className="mobile-label">Total gastado</p>
                      <p className="mobile-value">{money(c.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="mobile-label">Ultima compra</p>
                      <p className="mobile-value">{c.lastSale ? new Date(c.lastSale).toLocaleDateString('es-CL') : '-'}</p>
                    </div>
                  </div>
                  <div className="customer-mobile-actions" style={{ gap: 8 }}>
                    <Button type="button" variant="secondary" onClick={() => loadDetail(c)}>
                      Ver detalle
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setDeleteCustomer(c)}>
                      Eliminar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </Surface>

      {selected && (
        <Modal
          title={selected.name}
          description={`${selected.phone ? selected.phone : 'Sin telefono'}${selected.rut ? ` · RUT: ${selected.rut}` : ''}`}
          onClose={() => { setSelected(null); setDetail(null) }}
          size="wide"
          footer={null}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setEditMode(true); setEditForm({ name: selected.name, phone: selected.phone ?? '', rut: selected.rut ?? '' }) }}
            >
              Editar
            </Button>
            <Button type="button" variant="danger" onClick={() => setDeleteCustomer(selected)}>
              Eliminar
            </Button>
          </div>

          {editMode && (
            <form onSubmit={handleEdit} className="customer-edit-form">
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input required style={inputStyle} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="customer-edit-grid">
                <div>
                  <label style={labelStyle}>Telefono</label>
                  <input style={inputStyle} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>RUT</label>
                  <input style={inputStyle} value={editForm.rut} onChange={e => setEditForm({ ...editForm, rut: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={editLoading}>
                  {editLoading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}

          <div className="customer-detail-summary">
            <div className="customer-detail-card">
              <p>Total compras</p>
              <p>{selected.salesCount}</p>
            </div>
            <div className="customer-detail-card">
              <p>Total gastado</p>
              <p>{money(selected.totalSpent)}</p>
            </div>
            <div className="customer-detail-card">
              <p>Deuda pendiente</p>
              <p style={{ color: selected.totalDebt > 0 ? 'var(--danger)' : 'var(--success)' }}>{money(selected.totalDebt)}</p>
            </div>
          </div>

          <div className="customer-tabs">
            {(['sales', 'debts'] as const).map(tab => (
              <Button
                key={tab}
                type="button"
                variant={activeTab === tab ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'sales' ? 'Compras' : 'Deudas'}
              </Button>
            ))}
          </div>

          {loadingDetail ? (
            <p className="loading-detail">Cargando detalle...</p>
          ) : detail && (
            <>
              {activeTab === 'sales' && (
                detail.sales.length === 0 ? (
                  <EmptyState
                    title="Sin compras registradas"
                    description="Este cliente aun no tiene compras asociadas."
                  />
                ) : (
                  <div className="activity-list">
                    {detail.sales.map((sale: any, i: number) => (
                      <div key={i} className="activity-item">
                        <div className="activity-head">
                          <span className="activity-date">
                            {new Date(sale.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Badge variant="info">{paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}</Badge>
                            {sale.status === 'cancelled' && <Badge variant="neutral">Anulada</Badge>}
                            <span className="activity-total">{money(Number(sale.total))}</span>
                          </div>
                        </div>
                        {sale.items.map((item: any, j: number) => (
                          <div key={j} className="activity-line">
                            <span>{item.productName} x {Number(item.qty).toFixed(1)}</span>
                            <span>{money(Number(item.subtotal))}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'debts' && (
                detail.debts.length === 0 ? (
                  <EmptyState
                    title="Sin deudas pendientes"
                    description="Este cliente no registra deudas asociadas."
                  />
                ) : (
                  <div className="activity-list">
                    {detail.debts.map((debt: any, i: number) => (
                      <div key={i} className="activity-item" style={{ borderColor: debt.status === 'pending' ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
                        <div className="activity-head">
                          <span className="activity-date">{new Date(debt.createdAt).toLocaleDateString('es-CL')}</span>
                          <Badge variant={debt.status === 'paid' ? 'success' : 'danger'}>
                            {debt.status === 'paid' ? 'Pagada' : 'Pendiente'}
                          </Badge>
                        </div>
                        <div className="activity-line">
                          <span>Total: {money(Number(debt.amount))}</span>
                          <span>Pagado: {money(Number(debt.paid))}</span>
                          <strong style={{ color: debt.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                            Saldo: {money(Number(debt.balance))}
                          </strong>
                        </div>
                        {debt.payments.length > 0 && (
                          <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Abonos:</p>
                            {debt.payments.map((p: any, j: number) => (
                              <div key={j} className="activity-line">
                                <span>{new Date(p.createdAt).toLocaleDateString('es-CL')}</span>
                                <span style={{ color: 'var(--success)' }}>+{money(Number(p.amount))}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(deleteCustomer)}
        title="Eliminar cliente"
        description="Esta accion eliminara el cliente del listado si no tiene historial asociado."
        cancelLabel="Cancelar"
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onCancel={() => {
          if (deleteLoading) return
          setDeleteCustomer(null)
        }}
        onConfirm={handleDeleteCustomer}
      >
        <p>
          Cliente: <strong style={{ color: 'var(--text)' }}>{deleteCustomer?.name}</strong>. Si tiene compras o deudas registradas, el sistema conservara el cliente para proteger el historial.
        </p>
      </ConfirmDialog>
    </div>
  )
}

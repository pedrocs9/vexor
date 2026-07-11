/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

const inputStyle: any = {
  padding: '10px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text)',
  fontSize: 14, outline: 'none', width: '100%',
}

const labelStyle: any = {
  fontSize: 12, color: 'var(--muted)',
  display: 'block', marginBottom: 6,
}

const emptyForm = { name: '', rut: '', phone: '', email: '' }

function SupplierForm({ data, onChange, onSubmit, onClose, isLoading, title, submitLabel }: any) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '32px',
        width: '100%', maxWidth: 480,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20, fontWeight: 700,
          color: 'var(--text)', marginBottom: 24,
        }}>
          {title}
        </h2>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input required style={inputStyle} value={data.name}
              onChange={e => onChange({ ...data, name: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>RUT</label>
              <input style={inputStyle} value={data.rut}
                onChange={e => onChange({ ...data, rut: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input style={inputStyle} value={data.phone}
                onChange={e => onChange({ ...data, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputStyle} value={data.email}
              onChange={e => onChange({ ...data, email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} style={{
              flex: 1, padding: '11px', background: 'var(--cyan)',
              color: 'var(--bg)', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {isLoading ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SuppliersClient({ suppliers, tenantId }: {
  suppliers: any[]
  tenantId:  number
}) {
  const [search, setSearch]             = useState('')
  const [showForm, setShowForm]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [editSupplier, setEditSupplier] = useState<any>(null)
  const [editForm, setEditForm]         = useState<any>(null)
  const [editLoading, setEditLoading]   = useState(false)

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.rut && s.rut.includes(search)) ||
    (s.phone && s.phone.includes(search))
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tenantId }),
    })
    setLoading(false)
    setShowForm(false)
    setForm(emptyForm)
    window.location.reload()
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true)
    await fetch(`/api/suppliers/${editSupplier.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditLoading(false)
    setEditSupplier(null)
    window.location.reload()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, RUT o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320 }}
        />
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px', background: 'var(--cyan)',
            color: 'var(--bg)', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          + Nuevo proveedor
        </button>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Nombre', 'RUT', 'Teléfono', 'Email', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--muted)', textTransform: 'uppercase',
                  letterSpacing: '.06em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '48px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  {suppliers.length === 0
                    ? 'Aún no hay proveedores. Agrega el primero.'
                    : 'No se encontraron proveedores.'}
                </td>
              </tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} style={{
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                  {s.name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {s.rut ?? '—'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {s.phone ?? '—'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {s.email ?? '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 100,
                    background: s.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: s.active ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {s.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => {
                      setEditSupplier(s)
                      setEditForm({
                        name:   s.name,
                        rut:    s.rut   ?? '',
                        phone:  s.phone ?? '',
                        email:  s.email ?? '',
                        active: s.active,
                      })
                    }}
                    style={{
                      fontSize: 12, padding: '4px 12px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 6, color: 'var(--muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <SupplierForm
          title="Nuevo proveedor"
          data={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isLoading={loading}
          submitLabel="Guardar proveedor"
        />
      )}

      {editSupplier && editForm && (
        <SupplierForm
          title="Editar proveedor"
          data={editForm}
          onChange={setEditForm}
          onSubmit={handleEdit}
          onClose={() => setEditSupplier(null)}
          isLoading={editLoading}
          submitLabel="Guardar cambios"
        />
      )}
    </div>
  )
}
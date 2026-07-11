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

const ROLES = [
  { value: 'admin',     label: 'Admin',     desc: 'Acceso total' },
  { value: 'cajero',    label: 'Cajero',    desc: 'Solo POS y caja' },
  { value: 'bodeguero', label: 'Bodeguero', desc: 'Solo inventario' },
]

const emptyForm = { name: '', email: '', password: '', role: 'cajero' }

function UserForm({ title, data, onChange, onSubmit, onClose, isLoading, submitLabel, isEdit }: any) {
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
        width: '100%', maxWidth: 460,
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
          {!isEdit && (
            <div>
              <label style={labelStyle}>Email *</label>
              <input required type="email" style={inputStyle} value={data.email}
                onChange={e => onChange({ ...data, email: e.target.value })} />
            </div>
          )}
          <div>
            <label style={labelStyle}>
              {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              required={!isEdit}
              style={inputStyle}
              value={data.password}
              autoComplete="new-password"
              onChange={e => onChange({ ...data, password: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Rol *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map(r => (
                <label key={r.value} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  border: `1px solid ${data.role === r.value ? 'var(--cyan)' : 'var(--border)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  background: data.role === r.value ? 'rgba(14,165,233,0.06)' : 'transparent',
                }}>
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={data.role === r.value}
                    onChange={() => onChange({ ...data, role: r.value })}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {isEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="active"
                checked={data.active}
                onChange={e => onChange({ ...data, active: e.target.checked })}
              />
              <label htmlFor="active" style={{ fontSize: 14, color: 'var(--text)', cursor: 'pointer' }}>
                Usuario activo
              </label>
            </div>
          )}
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

export default function UsersClient({ users, tenantId }: {
  users:    any[]
  tenantId: number
}) {
  const [showForm, setShowForm]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [editUser, setEditUser]         = useState<any>(null)
  const [editForm, setEditForm]         = useState<any>(null)
  const [editLoading, setEditLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/users', {
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
    await fetch(`/api/users/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditLoading(false)
    setEditUser(null)
    window.location.reload()
  }

  const roleColors: any = {
    admin:     { bg: 'rgba(14,165,233,0.1)',   color: 'var(--cyan)' },
    cajero:    { bg: 'rgba(16,185,129,0.1)',   color: 'var(--success)' },
    bodeguero: { bg: 'rgba(245,158,11,0.1)',   color: 'var(--warning)' },
  }

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px', background: 'var(--cyan)',
            color: 'var(--bg)', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          + Nuevo usuario
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
              {['Nombre', 'Email', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
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
            {users.map((u, i) => (
              <tr key={u.id} style={{
                borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                  {u.name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {u.email}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 100,
                    background: roleColors[u.role]?.bg,
                    color: roleColors[u.role]?.color,
                    fontWeight: 500,
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 100,
                    background: u.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: u.active ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('es-CL')
                    : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => {
                      setEditUser(u)
                      setEditForm({
                        name:     u.name,
                        role:     u.role,
                        active:   u.active,
                        password: '',
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
        <UserForm
          title="Nuevo usuario"
          data={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isLoading={loading}
          submitLabel="Crear usuario"
          isEdit={false}
        />
      )}

      {editUser && editForm && (
        <UserForm
          title="Editar usuario"
          data={editForm}
          onChange={setEditForm}
          onSubmit={handleEdit}
          onClose={() => setEditUser(null)}
          isLoading={editLoading}
          submitLabel="Guardar cambios"
          isEdit={true}
        />
      )}
    </div>
  )
}
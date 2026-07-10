'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '48px 40px',
        width: '100%', maxWidth: 380,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'var(--cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 16, fontWeight: 700, color: 'var(--bg)',
            margin: '0 auto 16px',
          }}>
            V
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6,
          }}>
            Vexor
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Ingresa a tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              padding: '12px 16px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)',
              fontSize: 14, outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
            onBlur={e  => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              padding: '12px 16px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text)',
              fontSize: 14, outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
            onBlur={e  => e.currentTarget.style.borderColor = 'var(--border)'}
          />

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: 'var(--cyan)', color: 'var(--bg)',
              fontSize: 14, fontWeight: 600,
              border: 'none', borderRadius: 10,
              cursor: loading ? 'wait' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
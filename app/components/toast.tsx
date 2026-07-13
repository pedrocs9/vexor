'use client'

import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

type Toast = {
  id: string
  message: string
  type: ToastType
}

type ToastInput = string | { id?: string; message: string }

let addToastFn: ((toast: Toast, duration?: number | null) => void) | null = null
let updateToastFn: ((id: string, patch: Partial<Omit<Toast, 'id'>>, duration?: number | null) => void) | null = null
let dismissToastFn: ((id?: string) => void) | null = null

const durations: Record<ToastType, number | null> = {
  success: 3000,
  info: 3000,
  warning: 5000,
  error: 7000,
  loading: null,
}

function normalize(input: ToastInput): Toast {
  if (typeof input === 'string') {
    return { id: `${Date.now()}-${Math.random()}`, message: input, type: 'success' }
  }
  return { id: input.id ?? `${Date.now()}-${Math.random()}`, message: input.message, type: 'success' }
}

function push(type: ToastType, input: ToastInput) {
  const toast = { ...normalize(input), type }
  addToastFn?.(toast, durations[type])
  return toast.id
}

export const notify = {
  success: (input: ToastInput) => push('success', input),
  error: (input: ToastInput) => push('error', input),
  warning: (input: ToastInput) => push('warning', input),
  info: (input: ToastInput) => push('info', input),
  loading: (input: ToastInput) => push('loading', input),
  update: (id: string, patch: { message?: string; type?: ToastType; duration?: number | null }) => {
    const type = patch.type ?? 'success'
    updateToastFn?.(id, { message: patch.message, type: patch.type }, patch.duration ?? durations[type])
  },
  dismiss: (id?: string) => dismissToastFn?.(id),
}

export function toast(message: string, type: Exclude<ToastType, 'info' | 'loading'> = 'success') {
  return push(type, message)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>()

    const scheduleDismiss = (id: string, duration?: number | null) => {
      const current = timers.get(id)
      if (current) clearTimeout(current)
      if (duration === null || duration === undefined) return
      timers.set(id, setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        timers.delete(id)
      }, duration))
    }

    addToastFn = (toast, duration) => {
      setToasts(prev => [toast, ...prev.filter(t => t.id !== toast.id)].slice(0, 3))
      scheduleDismiss(toast.id, duration)
    }

    updateToastFn = (id, patch, duration) => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
      scheduleDismiss(id, duration)
    }

    dismissToastFn = (id) => {
      if (!id) {
        timers.forEach(timer => clearTimeout(timer))
        timers.clear()
        setToasts([])
        return
      }
      const current = timers.get(id)
      if (current) clearTimeout(current)
      timers.delete(id)
      setToasts(prev => prev.filter(t => t.id !== id))
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer))
      addToastFn = null
      updateToastFn = null
      dismissToastFn = null
    }
  }, [])

  const meta: Record<ToastType, { label: string; tone: string; icon: string }> = {
    success: { label: 'Correcto', tone: 'success', icon: 'check' },
    error: { label: 'Error', tone: 'error', icon: 'x' },
    warning: { label: 'Atencion', tone: 'warning', icon: '!' },
    info: { label: 'Informacion', tone: 'info', icon: 'i' },
    loading: { label: 'Procesando', tone: 'loading', icon: '' },
  }

  if (toasts.length === 0) return null

  return (
    <div className="v-toast-stack" aria-live="polite" aria-relevant="additions text">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`v-toast v-toast--${meta[t.type].tone}`}
          role={t.type === 'error' ? 'alert' : 'status'}
          aria-live={t.type === 'error' ? 'assertive' : 'polite'}
        >
          <span className="v-toast__icon" aria-hidden="true">
            {t.type === 'loading' ? <span className="v-btn__spinner" /> : meta[t.type].icon}
          </span>
          <span>
            <strong>{meta[t.type].label}</strong>
            {t.message}
          </span>
          <button type="button" aria-label="Cerrar notificacion" onClick={() => notify.dismiss(t.id)}>
            x
          </button>
        </div>
      ))}
      <style>{`
        .v-toast-stack {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: min(360px, calc(100vw - 32px));
        }
        .v-toast {
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr) 28px;
          gap: 10px;
          align-items: center;
          padding: 12px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: color-mix(in srgb, var(--surface) 96%, transparent);
          box-shadow: 0 16px 44px rgba(0,0,0,.28);
          animation: v-toast-in .18s ease-out;
        }
        .v-toast__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: var(--radius-md);
          font-weight: 900;
        }
        .v-toast strong {
          display: block;
          margin-bottom: 2px;
          color: var(--text);
          font-size: 12px;
        }
        .v-toast span:last-of-type {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.35;
        }
        .v-toast button {
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
        }
        .v-toast--success .v-toast__icon { color: var(--success); background: rgba(16,185,129,.12); }
        .v-toast--error .v-toast__icon { color: var(--danger); background: rgba(239,68,68,.12); }
        .v-toast--warning .v-toast__icon { color: var(--warning); background: rgba(245,158,11,.12); }
        .v-toast--info .v-toast__icon, .v-toast--loading .v-toast__icon { color: var(--cyan-l); background: rgba(14,165,233,.12); }
        @keyframes v-toast-in {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          .v-toast-stack {
            right: 16px;
            bottom: calc(16px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  )
}

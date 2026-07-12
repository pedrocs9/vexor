'use client'

import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning'

type Toast = {
  id:      number
  message: string
  type:    ToastType
}

let addToastFn: ((message: string, type: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'success') {
  if (addToastFn) addToastFn(message, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }
    return () => { addToastFn = null }
  }, [])

  const colors = {
    success: { bg: 'rgba(16,185,129,0.95)', border: 'var(--success)', icon: '✓' },
    error:   { bg: 'rgba(239,68,68,0.95)',  border: 'var(--danger)',  icon: '✕' },
    warning: { bg: 'rgba(245,158,11,0.95)', border: 'var(--warning)', icon: '⚠️' },
  }

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background:   colors[t.type].bg,
          border:       `1px solid ${colors[t.type].border}`,
          borderRadius: 10, padding: '12px 18px',
          display:      'flex', alignItems: 'center', gap: 10,
          boxShadow:    '0 4px 20px rgba(0,0,0,0.3)',
          animation:    'slideIn .2s ease',
          minWidth:     240,
        }}>
          <span style={{ fontSize: 16 }}>{colors[t.type].icon}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
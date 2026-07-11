/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('vexor-theme')
    const isDark = saved !== 'light'
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    const theme = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vexor-theme', theme)
  }

  return (
    <button
      onClick={toggle}
      style={{
        width: '100%', padding: '9px 12px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 8, color: 'var(--muted)',
        fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 8,
        transition: 'border-color .15s, color .15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--cyan)'
        e.currentTarget.style.color = 'var(--cyan)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--muted)'
      }}
    >
      {dark ? '☀️ Modo claro' : '🌙 Modo oscuro'}
    </button>
  )
}
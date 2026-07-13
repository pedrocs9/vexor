'use client'

import { useEffect, useState } from 'react'

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width="18"
    >
      {dark ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : (
        <path d="M20 15.5A8 8 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z" />
      )}
    </svg>
  )
}

export default function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('vexor-theme')
    const isDark = saved !== 'light'
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="v-btn v-btn--ghost sidebar-tip"
      data-tooltip={dark ? 'Modo claro' : 'Modo oscuro'}
      onClick={toggle}
      title={collapsed ? (dark ? 'Modo claro' : 'Modo oscuro') : undefined}
      type="button"
      style={{
        width: '100%',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 8,
        marginBottom: 0,
      }}
    >
      <ThemeIcon dark={dark} />
      {!collapsed && (dark ? 'Modo claro' : 'Modo oscuro')}
    </button>
  )
}

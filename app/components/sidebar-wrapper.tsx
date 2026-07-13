/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import Sidebar from './sidebar'

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export default function SidebarWrapper({ user }: { user: any }) {
  const [open, setOpen]     = useState(true)
  const [mobile, setMobile] = useState(false)

  const setMargin = (isOpen: boolean, isMobile: boolean) => {
    if (isMobile) {
      document.documentElement.style.setProperty('--sidebar-w', '0px')
    } else {
      document.documentElement.style.setProperty('--sidebar-w', isOpen ? '252px' : '68px')
    }
  }

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 768
      setMobile(isMobile)
      const isOpen = !isMobile
      setOpen(isOpen)
      setMargin(isOpen, isMobile)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobile && open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobile, open])

  function handleToggle() {
    const next = !open
    setOpen(next)
    setMargin(next, mobile)
  }

  function closeMobile() {
    if (!mobile) return
    setOpen(false)
    setMargin(false, true)
  }

  return (
    <>
      {mobile && open && (
        <button
          aria-label="Cerrar navegacion"
          onClick={closeMobile}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.58)',
            border: 0,
            cursor: 'default',
          }}
          type="button"
        />
      )}

      {mobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 39,
          height: 56, background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          gap: 12,
        }}>
          <button
            aria-label="Abrir navegacion"
            onClick={() => { setOpen(true); setMargin(true, true) }}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', flexShrink: 0,
            }}
            type="button"
          >
            <MenuIcon />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 12, fontWeight: 900, color: 'var(--bg)',
              flexShrink: 0,
            }}>V</div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 15, fontWeight: 800, color: 'var(--text)',
                lineHeight: 1.1,
              }}>
                Vexor
              </p>
              <p style={{
                fontSize: 11,
                color: 'var(--muted)',
              }}>
                Navegacion
              </p>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        user={user}
        open={open}
        onToggle={handleToggle}
        mobile={mobile}
        onNavigate={closeMobile}
      />
    </>
  )
}

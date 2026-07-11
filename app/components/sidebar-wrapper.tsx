/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Sidebar from './sidebar'

export default function SidebarWrapper({ user }: { user: any }) {
  const [open, setOpen]   = useState(true)
  const [mobile, setMobile] = useState(false)

  const setMargin = (isOpen: boolean, isMobile: boolean) => {
    if (isMobile) {
      document.documentElement.style.setProperty('--sidebar-w', '0px')
    } else {
      document.documentElement.style.setProperty('--sidebar-w', isOpen ? '240px' : '64px')
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

  function handleToggle() {
    const next = !open
    setOpen(next)
    setMargin(next, mobile)
  }

  return (
    <>
      {/* Overlay mobile */}
      {mobile && open && (
        <div
          onClick={() => { setOpen(false); setMargin(false, true) }}
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
        />
      )}

      {/* Header mobile fijo */}
      {mobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 39,
          height: 56, background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          gap: 12,
        }}>
          <button
            onClick={() => { setOpen(true); setMargin(true, true) }}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', flexShrink: 0,
            }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 12, fontWeight: 700, color: 'var(--bg)',
            }}>V</div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15, fontWeight: 600, color: 'var(--text)',
            }}>
              Vexor
            </span>
          </div>
        </div>
      )}

      <Sidebar user={user} open={open} onToggle={handleToggle} mobile={mobile} />
    </>
  )
}
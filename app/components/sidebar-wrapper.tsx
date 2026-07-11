/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Sidebar from './sidebar'

export default function SidebarWrapper({ user }: { user: any }) {
  const [open, setOpen] = useState(true)
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
      {mobile && open && (
        <div
          onClick={() => { setOpen(false); setMargin(false, true) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {mobile && !open && (
        <button
          onClick={() => { setOpen(true); setMargin(true, true) }}
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: 60,
            width: 40, height: 40, borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)',
          }}
        >
          ☰
        </button>
      )}

      <Sidebar user={user} open={open} onToggle={handleToggle} mobile={mobile} />
    </>
  )
}
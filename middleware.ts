import { auth } from './app/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/api/auth']

const MODULE_ROUTES: Record<string, string> = {
  '/dashboard/pos':        'pos',
  '/dashboard/inventario': 'inventory',
  '/dashboard/proveedores':'suppliers',
  '/dashboard/compras':    'purchases',
  '/dashboard/clientes':   'customers',
  '/dashboard/deudas':     'debts',
  '/dashboard/pan':        'bread',
  '/dashboard/envases':    'containers',
  '/dashboard/reportes':   'reports',
  '/dashboard/caja':       'cash',
  '/dashboard/usuarios':   'users',
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const session      = req.auth

  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname === '/dashboard' || pathname === '/dashboard/configuracion') {
    return NextResponse.next()
  }

  const requiredModule = MODULE_ROUTES[pathname]
  if (requiredModule) {
    try {
      const res = await fetch(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `${req.nextUrl.origin}/api/tenant-modules?tenantId=${(session.user as any).tenantId}&module=${requiredModule}`
      )
      const { active, suspended } = await res.json()

      if (suspended) {
        return NextResponse.redirect(new URL('/dashboard?suspended=1', req.url))
      }

      if (!active) {
        return NextResponse.redirect(new URL('/dashboard?module=locked', req.url))
      }
    } catch {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
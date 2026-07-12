import { db } from './db'
import { tenantModules, tenantSubscriptions } from './schema'
import { eq, and } from 'drizzle-orm'

export const MODULE_ROUTES: Record<string, string> = {
  '/dashboard/pos':           'pos',
  '/dashboard/inventario':    'inventory',
  '/dashboard/proveedores':   'suppliers',
  '/dashboard/compras':       'purchases',
  '/dashboard/clientes':      'customers',
  '/dashboard/deudas':        'debts',
  '/dashboard/pan':           'bread',
  '/dashboard/envases':       'containers',
  '/dashboard/reportes':      'reports',
  '/dashboard/caja':          'cash',
  '/dashboard/usuarios':      'users',
}

export async function getTenantModules(tenantId: number): Promise<string[]> {
  const modules = await db.select().from(tenantModules)
    .where(and(
      eq(tenantModules.tenantId, tenantId),
      eq(tenantModules.active, true),
    ))
  return modules.map(m => m.module)
}

export async function getTenantSubscription(tenantId: number) {
  const [sub] = await db.select().from(tenantSubscriptions)
    .where(eq(tenantSubscriptions.tenantId, tenantId))
  return sub ?? null
}

export function hasModule(modules: string[], module: string): boolean {
  return modules.includes(module)
}
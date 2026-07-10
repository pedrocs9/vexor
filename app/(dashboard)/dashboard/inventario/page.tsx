/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { products, categories } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import ProductsClient from '../../../components/products-client'

export const dynamic = 'force-dynamic'

export default async function InventarioPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as any
  const tenantId = user.tenantId

  const [allProducts, allCategories] = await Promise.all([
    db.select().from(products).where(eq(products.tenantId, tenantId)),
    db.select().from(categories).where(eq(categories.tenantId, tenantId)),
  ])

  return (
    <div style={{ padding: '32px 32px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 32,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26, fontWeight: 700,
            color: 'var(--text)', marginBottom: 4,
          }}>
            Inventario
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            {allProducts.length} productos registrados
          </p>
        </div>
      </div>

      <ProductsClient
        products={allProducts}
        categories={allCategories}
        tenantId={tenantId}
      />
    </div>
  )
}
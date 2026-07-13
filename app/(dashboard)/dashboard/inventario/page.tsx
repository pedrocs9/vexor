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
    <ProductsClient
      products={allProducts}
      categories={allCategories}
      tenantId={tenantId}
    />
  )
}

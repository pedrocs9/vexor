/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { products, categories, customers } from '../../../lib/schema'
import { eq } from 'drizzle-orm'
import PosClient from '../../../components/pos-client'

export const dynamic = 'force-dynamic'

export default async function PosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const [allProducts, allCategories, allCustomers] = await Promise.all([
    db.select().from(products)
      .where(eq(products.tenantId, tenantId)),
    db.select().from(categories)
      .where(eq(categories.tenantId, tenantId)),
    db.select().from(customers)
      .where(eq(customers.tenantId, tenantId)),
  ])

  return (
    <PosClient
      products={allProducts}
      categories={allCategories}
      customers={allCustomers}
      tenantId={tenantId}
      userId={Number(user.id)}
    />
  )
}
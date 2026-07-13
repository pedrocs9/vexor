/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import { db } from '../../../lib/db'
import { purchaseInvoices, purchaseInvoiceItems, suppliers, products } from '../../../lib/schema'
import { eq, desc } from 'drizzle-orm'
import PurchasesClient from '../../../components/purchases-client'

export const dynamic = 'force-dynamic'

export default async function ComprasPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user     = session.user as any
  const tenantId = user.tenantId

  const [allInvoices, allSuppliers, allProducts] = await Promise.all([
    db.select().from(purchaseInvoices)
      .where(eq(purchaseInvoices.tenantId, tenantId))
      .orderBy(desc(purchaseInvoices.date)),
    db.select().from(suppliers)
      .where(eq(suppliers.tenantId, tenantId)),
    db.select().from(products)
      .where(eq(products.tenantId, tenantId)),
  ])

  const invoicesWithItems = await Promise.all(
    allInvoices.map(async inv => {
      const items = await db.select().from(purchaseInvoiceItems)
        .where(eq(purchaseInvoiceItems.invoiceId, inv.id))
      return { ...inv, items }
    })
  )

  return (
    <div style={{ padding: '32px' }}>
      <PurchasesClient
        invoices={invoicesWithItems}
        suppliers={allSuppliers}
        products={allProducts}
        tenantId={tenantId}
      />
    </div>
  )
}

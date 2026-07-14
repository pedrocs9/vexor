import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './app/lib/schema'

const sql = neon(process.env.DATABASE_URL!)
const db  = drizzle(sql, { schema })

const MODULES = [
  { module: 'pos',             price: '0'  },
  { module: 'inventory',       price: '0'  },
  { module: 'dashboard',       price: '0'  },
  { module: 'suppliers',       price: '3000'  },
  { module: 'purchases',       price: '5000'  },
  { module: 'customers',       price: '3000'  },
  { module: 'debts',           price: '5000'  },
  { module: 'bread',           price: '3000'  },
  { module: 'containers',      price: '3000'  },
  { module: 'reports',         price: '5000'  },
  { module: 'cash',            price: '3000'  },
  { module: 'users',           price: '3000'  },
  { module: 'sii', price: '10000' },
]

async function seed() {
  const tenants = await db.select().from(schema.tenants)
  console.log(`Encontrados ${tenants.length} tenants`)

  for (const tenant of tenants) {
    console.log(`Activando módulos para: ${tenant.name}`)

    for (const mod of MODULES) {
      await db.insert(schema.tenantModules).values({
        tenantId: tenant.id,
        module:   mod.module,
        active:   true,
        price:    mod.price,
      }).onConflictDoNothing()
    }

    await db.insert(schema.tenantSubscriptions).values({
      tenantId:    tenant.id,
      status:      'active',
      basePrice:   '15000',
      totalPrice:  '15000',
      billingDay:  1,
      nextBilling: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    }).onConflictDoNothing()
  }

  console.log('Módulos activados correctamente')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })

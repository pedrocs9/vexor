import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { db } from './db'
import { tenants, users } from './schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Creando tenant...')

  const [tenant] = await db.insert(tenants).values({
    name:         'Distribuidora Hermano',
    businessType: 'distribuidora',
    plan:         'enterprise',
    status:       'active',
    rut:          '12345678-9',
    phone:        '+56912345678',
    address:      'Santiago, Chile',
  }).returning()

  console.log('Tenant creado:', tenant.id)

  const passwordHash = await bcrypt.hash('vexor2026', 10)

  await db.insert(users).values([
    {
      tenantId:     tenant.id,
      name:         'Pedro Admin',
      email:        'admin@vexor.cl',
      passwordHash,
      role:         'admin',
      active:       true,
    },
    {
      tenantId:     tenant.id,
      name:         'Cajero Demo',
      email:        'cajero@vexor.cl',
      passwordHash,
      role:         'cajero',
      active:       true,
    },
  ])

  console.log('Usuarios creados')
  console.log('---')
  console.log('Email:    admin@vexor.cl')
  console.log('Password: vexor2026')
  process.exit(0)
}

seed().catch(e => {
  console.error(e)
  process.exit(1)
})
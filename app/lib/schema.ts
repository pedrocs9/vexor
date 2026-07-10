import {
  pgTable, serial, text, timestamp,
  integer, decimal, boolean, pgEnum
} from 'drizzle-orm/pg-core'

export const roleEnum    = pgEnum('role',    ['admin', 'cajero', 'bodeguero'])
export const planEnum    = pgEnum('plan',    ['starter', 'pro', 'enterprise'])
export const statusEnum  = pgEnum('status',  ['active', 'inactive', 'suspended'])
export const paymentEnum = pgEnum('payment', ['cash', 'debit', 'credit', 'transfer'])
export const saleEnum    = pgEnum('sale_status', ['completed', 'cancelled', 'credit'])
export const moveEnum    = pgEnum('move_type', ['out', 'return'])

export const tenants = pgTable('tenants', {
  id:           serial('id').primaryKey(),
  name:         text('name').notNull(),
  businessType: text('business_type').notNull().default('generic'),
  plan:         planEnum('plan').notNull().default('starter'),
  status:       statusEnum('status').notNull().default('active'),
  rut:          text('rut'),
  phone:        text('phone'),
  address:      text('address'),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const users = pgTable('users', {
  id:           serial('id').primaryKey(),
  tenantId:     integer('tenant_id').notNull().references(() => tenants.id),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role:         roleEnum('role').notNull().default('cajero'),
  active:       boolean('active').notNull().default(true),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id:        serial('id').primaryKey(),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  name:      text('name').notNull(),
  parentId:  integer('parent_id'),
})

export const suppliers = pgTable('suppliers', {
  id:        serial('id').primaryKey(),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  name:      text('name').notNull(),
  rut:       text('rut'),
  phone:     text('phone'),
  email:     text('email'),
  active:    boolean('active').notNull().default(true),
})

export const products = pgTable('products', {
  id:          serial('id').primaryKey(),
  tenantId:    integer('tenant_id').notNull().references(() => tenants.id),
  categoryId:  integer('category_id').references(() => categories.id),
  supplierId:  integer('supplier_id').references(() => suppliers.id),
  name:        text('name').notNull(),
  sku:         text('sku'),
  barcode:     text('barcode'),
  price:       decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost:        decimal('cost',  { precision: 10, scale: 2 }),
  stock:       decimal('stock', { precision: 10, scale: 3 }).notNull().default('0'),
  minStock:    decimal('min_stock', { precision: 10, scale: 3 }).default('0'),
  unit:        text('unit').notNull().default('un'),
  imageUrl:    text('image_url'),
  expiresAt:   timestamp('expires_at'),
  active:      boolean('active').notNull().default(true),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const sales = pgTable('sales', {
  id:            serial('id').primaryKey(),
  tenantId:      integer('tenant_id').notNull().references(() => tenants.id),
  userId:        integer('user_id').references(() => users.id),
  total:         decimal('total', { precision: 10, scale: 2 }).notNull(),
  discount:      decimal('discount', { precision: 10, scale: 2 }).default('0'),
  paymentMethod: paymentEnum('payment_method').notNull().default('cash'),
  status:        saleEnum('sale_status').notNull().default('completed'),
  note:          text('note'),
  createdAt:     timestamp('created_at').defaultNow(),
})

export const saleItems = pgTable('sale_items', {
  id:        serial('id').primaryKey(),
  saleId:    integer('sale_id').notNull().references(() => sales.id),
  productId: integer('product_id').notNull().references(() => products.id),
  qty:       decimal('qty', { precision: 10, scale: 3 }).notNull(),
  price:     decimal('price', { precision: 10, scale: 2 }).notNull(),
  subtotal:  decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
})

export const subscriptions = pgTable('subscriptions', {
  id:        serial('id').primaryKey(),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  plan:      planEnum('plan').notNull(),
  status:    text('status').notNull().default('active'),
  expiresAt: timestamp('expires_at'),
  mpId:      text('mp_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const breadOrders = pgTable('bread_orders', {
  id:          serial('id').primaryKey(),
  tenantId:    integer('tenant_id').notNull().references(() => tenants.id),
  supplierId:  integer('supplier_id').references(() => suppliers.id),
  date:        timestamp('date').defaultNow(),
  kgOrdered:   decimal('kg_ordered', { precision: 10, scale: 3 }).notNull(),
  pricePerKg:  decimal('price_per_kg', { precision: 10, scale: 2 }).notNull(),
  totalCost:   decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
})

export const breadReturns = pgTable('bread_returns', {
  id:            serial('id').primaryKey(),
  orderId:       integer('order_id').notNull().references(() => breadOrders.id),
  date:          timestamp('date').defaultNow(),
  kgReturned:    decimal('kg_returned', { precision: 10, scale: 3 }).notNull(),
  kgSold:        decimal('kg_sold',     { precision: 10, scale: 3 }).notNull(),
  kgLost:        decimal('kg_lost',     { precision: 10, scale: 3 }).default('0'),
  amountCredited:decimal('amount_credited', { precision: 10, scale: 2 }),
})

export const customers = pgTable('customers', {
  id:        serial('id').primaryKey(),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  name:      text('name').notNull(),
  phone:     text('phone'),
  rut:       text('rut'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const containers = pgTable('containers', {
  id:           serial('id').primaryKey(),
  tenantId:     integer('tenant_id').notNull().references(() => tenants.id),
  name:         text('name').notNull(),
  depositValue: decimal('deposit_value', { precision: 10, scale: 2 }).default('0'),
  active:       boolean('active').notNull().default(true),
})

export const containerMovements = pgTable('container_movements', {
  id:          serial('id').primaryKey(),
  tenantId:    integer('tenant_id').notNull().references(() => tenants.id),
  customerId:  integer('customer_id').references(() => customers.id),
  containerId: integer('container_id').notNull().references(() => containers.id),
  saleId:      integer('sale_id').references(() => sales.id),
  type:        moveEnum('move_type').notNull(),
  qty:         integer('qty').notNull(),
  date:        timestamp('date').defaultNow(),
  note:        text('note'),
})
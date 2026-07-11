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
  customerId:    integer('customer_id').references(() => customers.id), // ← agrega esta línea
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

export const tenantSettings = pgTable('tenant_settings', {
  id:          serial('id').primaryKey(),
  tenantId:    integer('tenant_id').notNull().references(() => tenants.id).unique(),
  logoUrl:     text('logo_url'),
  businessName: text('business_name'),
  rut:         text('rut'),
  address:     text('address'),
  phone:       text('phone'),
  email:       text('email'),
  commune:     text('commune'),
  city:        text('city'),
  website:     text('website'),
  updatedAt:   timestamp('updated_at').defaultNow(),
})

export const cashClosings = pgTable('cash_closings', {
  id:           serial('id').primaryKey(),
  tenantId:     integer('tenant_id').notNull().references(() => tenants.id),
  userId:       integer('user_id').references(() => users.id),
  date:         timestamp('date').defaultNow(),
  cashSales:    decimal('cash_sales',     { precision: 10, scale: 2 }).default('0'),
  debitSales:   decimal('debit_sales',    { precision: 10, scale: 2 }).default('0'),
  creditSales:  decimal('credit_sales',   { precision: 10, scale: 2 }).default('0'),
  transferSales:decimal('transfer_sales', { precision: 10, scale: 2 }).default('0'),
  totalSales:   decimal('total_sales',    { precision: 10, scale: 2 }).default('0'),
  cashCounted:  decimal('cash_counted',   { precision: 10, scale: 2 }).default('0'),
  difference:   decimal('difference',     { precision: 10, scale: 2 }).default('0'),
  note:         text('note'),
  status:       text('status').notNull().default('open'),
})

export const purchaseInvoices = pgTable('purchase_invoices', {
  id:           serial('id').primaryKey(),
  tenantId:     integer('tenant_id').notNull().references(() => tenants.id),
  supplierId:   integer('supplier_id').references(() => suppliers.id),
  invoiceNumber:text('invoice_number'),
  date:         timestamp('date').defaultNow(),
  total:        decimal('total', { precision: 10, scale: 2 }).notNull(),
  status:       text('status').notNull().default('pending'),
  note:         text('note'),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const purchaseInvoiceItems = pgTable('purchase_invoice_items', {
  id:        serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => purchaseInvoices.id),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  qty:       decimal('qty', { precision: 10, scale: 3 }).notNull(),
  cost:      decimal('cost', { precision: 10, scale: 2 }).notNull(),
  subtotal:  decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
})

export const debts = pgTable('debts', {
  id:          serial('id').primaryKey(),
  tenantId:    integer('tenant_id').notNull().references(() => tenants.id),
  customerId:  integer('customer_id').notNull().references(() => customers.id),
  saleId:      integer('sale_id').references(() => sales.id),
  amount:      decimal('amount',  { precision: 10, scale: 2 }).notNull(),
  paid:        decimal('paid',    { precision: 10, scale: 2 }).notNull().default('0'),
  balance:     decimal('balance', { precision: 10, scale: 2 }).notNull(),
  status:      text('status').notNull().default('pending'),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const debtPayments = pgTable('debt_payments', {
  id:        serial('id').primaryKey(),
  debtId:    integer('debt_id').notNull().references(() => debts.id),
  amount:    decimal('amount', { precision: 10, scale: 2 }).notNull(),
  note:      text('note'),
  createdAt: timestamp('created_at').defaultNow(),
})


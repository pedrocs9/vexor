/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: '30px 40px',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logo: {
    width: 60, height: 60,
    borderRadius: 8,
  },
  businessInfo: {
    flex: 1,
    marginLeft: 12,
  },
  businessName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0EA5E9',
    marginBottom: 3,
  },
  businessDetail: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  saleInfo: {
    alignItems: 'flex-end',
  },
  saleNumber: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  saleDate: {
    fontSize: 9,
    color: '#64748b',
  },
  internalReceipt: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0EA5E9',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voidedBanner: {
    marginBottom: 12,
    padding: '8px 10px',
    borderRadius: 4,
    backgroundColor: '#fee2e2',
  },
  voidedText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#b91c1c',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: '6px 10px',
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7px 10px',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  colProduct: { flex: 3 },
  colQty:     { flex: 1, textAlign: 'center' },
  colPrice:   { flex: 1.5, textAlign: 'right' },
  colTotal:   { flex: 1.5, textAlign: 'right' },
  headerText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  cellText: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  cellMuted: {
    fontSize: 9,
    color: '#64748b',
  },
  totals: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0EA5E9',
  },
  paymentBadge: {
    marginTop: 12,
    padding: '6px 12px',
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  paymentValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0EA5E9',
  },
  customerBox: {
    marginTop: 12,
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  customerLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  footer: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 2,
  },
  footerBrand: {
    fontSize: 8,
    color: '#0EA5E9',
    textAlign: 'center',
  },
})

const paymentLabels: any = {
  cash:     'Efectivo',
  debit:    'Débito',
  credit:   'Crédito',
  transfer: 'Transferencia',
  fiado:    'Fiado',
}

function ReceiptDocument({ sale, items, settings, customer }: {
  sale:     any
  items:    any[]
  settings: any
  customer: any
}) {
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.subtotal), 0)
  const discount = Number(sale.discount ?? 0)
  const total    = Number(sale.total)

  return (
    <Document>
      <Page size={[226, 'auto']} style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
            {settings?.logoUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={settings.logoUrl} style={styles.logo} />
            )}
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>
                {settings?.businessName ?? 'Mi Negocio'}
              </Text>
              {settings?.rut && (
                <Text style={styles.businessDetail}>RUT: {settings.rut}</Text>
              )}
              {settings?.address && (
                <Text style={styles.businessDetail}>{settings.address}</Text>
              )}
              {settings?.phone && (
                <Text style={styles.businessDetail}>Tel: {settings.phone}</Text>
              )}
            </View>
          </View>
          <View style={styles.saleInfo}>
            <Text style={styles.saleNumber}>#{sale.id}</Text>
            <Text style={styles.saleDate}>
              {new Date(sale.createdAt).toLocaleDateString('es-CL', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </Text>
            <Text style={styles.saleDate}>
              {new Date(sale.createdAt).toLocaleTimeString('es-CL', {
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
            <Text style={styles.internalReceipt}>Comprobante interno</Text>
          </View>
        </View>

        {sale.status === 'cancelled' && (
          <View style={styles.voidedBanner}>
            <Text style={styles.voidedText}>Venta anulada</Text>
            {sale.voidedAt && (
              <Text style={styles.footerText}>
                Anulada el {new Date(sale.voidedAt).toLocaleString('es-CL')}
              </Text>
            )}
          </View>
        )}

        {/* Cliente */}
        {customer && (
          <View style={styles.customerBox}>
            <Text style={styles.customerLabel}>Cliente</Text>
            <Text style={styles.customerName}>{customer.name}</Text>
            {customer.phone && <Text style={styles.customerLabel}>{customer.phone}</Text>}
          </View>
        )}

        {/* Productos */}
        <Text style={styles.sectionTitle}>Detalle</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colProduct]}>Producto</Text>
            <Text style={[styles.headerText, styles.colQty]}>Cant.</Text>
            <Text style={[styles.headerText, styles.colPrice]}>Precio</Text>
            <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
          </View>
          {items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colProduct]}>{item.productName}</Text>
              <Text style={[styles.cellMuted, styles.colQty]}>{Number(item.qty).toFixed(1)}</Text>
              <Text style={[styles.cellMuted, styles.colPrice]}>${Number(item.price).toLocaleString('es-CL')}</Text>
              <Text style={[styles.cellText, styles.colTotal]}>${Number(item.subtotal).toLocaleString('es-CL')}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toLocaleString('es-CL')}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento</Text>
              <Text style={styles.totalValue}>-${discount.toLocaleString('es-CL')}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${total.toLocaleString('es-CL')}</Text>
          </View>
        </View>

        {/* Método de pago */}
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentLabel}>Método de pago</Text>
          <Text style={styles.paymentValue}>
            {paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}
          </Text>
        </View>

        {sale.paymentMethod === 'fiado' && (
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentLabel}>Condicion</Text>
            <Text style={styles.paymentValue}>Venta fiada</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Comprobante interno - no valido como boleta tributaria.</Text>
          <Text style={styles.footerText}>¡Gracias por su compra!</Text>
          <Text style={styles.footerBrand}>Powered by Vexor · pgstudio.tech</Text>
        </View>

      </Page>
    </Document>
  )
}

export async function generateReceipt(sale: any, items: any[], settings: any, customer: any) {
  const blob = await pdf(
    <ReceiptDocument
      sale={sale}
      items={items}
      settings={settings}
      customer={customer}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = `comprobante-interno-${sale.id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

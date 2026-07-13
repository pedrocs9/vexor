export default function SiiPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 4,
        }}>
          Boleta Electrónica SII 🧾
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          Emisión de documentos tributarios electrónicos
        </p>
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🚧</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20, fontWeight: 700,
          color: 'var(--text)', marginBottom: 12,
        }}>
          Módulo en configuración
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
          Estamos configurando la integración con el SII para tu negocio. Pronto podrás emitir boletas y facturas electrónicas directamente desde Vexor.
        </p>
        <div style={{
          background: 'rgba(14,165,233,0.08)',
          border: '1px solid rgba(14,165,233,0.2)',
          borderRadius: 10, padding: '16px 20px',
          textAlign: 'left', marginTop: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', marginBottom: 10 }}>
            Lo que incluirá este módulo:
          </p>
          {[
            'Emisión de boletas electrónicas desde el POS',
            'Emisión de facturas electrónicas',
            'Envío automático al SII',
            'Descarga de PDF con timbre electrónico',
            'Historial de documentos emitidos',
            'Integración con libro de ventas',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: 'var(--cyan)', fontSize: 12 }}>✓</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{item}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
          ¿Tienes urgencia? Escríbenos a{' '}
          <a href="mailto:hola@pgstudio.tech" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
            hola@pgstudio.tech
          </a>
        </p>
      </div>
    </div>
  )
}
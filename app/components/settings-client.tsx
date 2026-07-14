/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import ImageUpload from './image-upload'

const inputStyle: any = {
  padding: '10px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text)',
  fontSize: 14, outline: 'none', width: '100%',
}

const labelStyle: any = {
  fontSize: 12, color: 'var(--muted)',
  display: 'block', marginBottom: 6,
}

export default function SettingsClient({
  settings,
  tenantId,
}: {
  settings: any;
  tenantId: number;
}) {
  const [form, setForm] = useState({
    businessName: settings?.businessName ?? "",
    rut: settings?.rut ?? "",
    address: settings?.address ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    commune: settings?.commune ?? "",
    city: settings?.city ?? "",
    website: settings?.website ?? "",
    logoUrl: settings?.logoUrl ?? "",
    currency: settings?.currency ?? "CLP", // ← agrega esto
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (logoUploading) return;
    setLoading(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tenantId }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Logo */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 20,
            }}
          >
            Logo del negocio
          </h2>

          {form.logoUrl ? (
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <img
                src={form.logoUrl}
                alt="Logo"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: 8,
                  background: "var(--bg)",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 12,
                background: "var(--bg2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                margin: "0 auto 16px",
                border: "1px solid var(--border)",
              }}
            >
              🏪
            </div>
          )}

          <ImageUpload
            onUpload={(url) => setForm((current) => ({ ...current, logoUrl: url }))}
            onUploadingChange={setLogoUploading}
          />

          <p
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 10,
              textAlign: "center",
            }}
          >
            El logo aparecerá en el menú lateral y en los reportes
          </p>
        </div>

        {/* Datos del negocio */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 20,
            }}
          >
            Datos del negocio
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Nombre del negocio *</label>
              <input
                required
                style={inputStyle}
                value={form.businessName}
                placeholder="Ej: Distribuidora Los Robles"
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={labelStyle}>RUT</label>
                <input
                  style={inputStyle}
                  value={form.rut}
                  placeholder="12.345.678-9"
                  onChange={(e) => setForm({ ...form, rut: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  placeholder="+56 9 1234 5678"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  placeholder="contacto@negocio.cl"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Sitio web</label>
                <input
                  style={inputStyle}
                  value={form.website}
                  placeholder="www.minegocio.cl"
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Dirección</label>
              <input
                style={inputStyle}
                value={form.address}
                placeholder="Av. Principal 123"
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={labelStyle}>Comuna</label>
                <input
                  style={inputStyle}
                  value={form.commune}
                  placeholder="Santiago"
                  onChange={(e) =>
                    setForm({ ...form, commune: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <input
                  style={inputStyle}
                  value={form.city}
                  placeholder="Santiago"
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        {saved && (
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid var(--success)",
              color: "var(--success)",
              fontSize: 14,
            }}
          >
            ✓ Cambios guardados
          </div>
        )}
        <button
          type="submit"
          disabled={loading || logoUploading}
          style={{
            padding: "11px 28px",
            background: "var(--cyan)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {logoUploading ? "Subiendo logo..." : loading ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}

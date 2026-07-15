/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { ProductCatalogProps } from "./types";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function getProductInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";
}

export default function ProductCatalog({
  products,
  categories,
  selectedCat,
  setSelectedCat,
  search,
  setSearch,
  searchRef,
  isMobile,
  addToCart,
  setShowHistory,
  loadHistory,
}: ProductCatalogProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile ? "none" : "1px solid var(--border)",
        background: "var(--bg)",
        overflow: "hidden",
        height: isMobile ? "calc(100dvh - 56px)" : "100dvh",
      }}
    >
      <div
        style={{
          padding: isMobile ? "12px" : "18px 20px 14px",
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--bg2) 92%, var(--surface))",
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="text"
            aria-keyshortcuts="F2"
            aria-label="Buscar producto por nombre, SKU o codigo de barras"
            placeholder={isMobile ? "Buscar producto..." : "Buscar por nombre, SKU o escanear... (F2)"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => setSearchFocused(false)}
            onFocus={() => setSearchFocused(true)}
            autoFocus={!isMobile}
            style={{
              minHeight: isMobile ? 44 : 56,
              padding: isMobile ? "10px 14px 10px 40px" : "14px 18px 14px 48px",
              background: "var(--surface)",
              border: `1px solid ${searchFocused ? "var(--cyan)" : "var(--border-h)"}`,
              borderRadius: 12,
              color: "var(--text)",
              fontSize: isMobile ? 14 : 17,
              fontFamily: "var(--font-display)",
              fontWeight: 650,
              outline: "none",
              width: "100%",
              boxShadow: searchFocused ? "0 0 0 3px rgba(14,165,233,.16), 0 10px 30px rgba(0,0,0,0.12)" : "0 10px 30px rgba(0,0,0,0.12)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          <button
            onClick={() => setSelectedCat(null)}
            style={{
              padding: "6px 12px",
              borderRadius: 100,
              fontSize: 12,
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: selectedCat === null ? "rgba(14,165,233,0.14)" : "transparent",
              color: selectedCat === null ? "var(--cyan-l)" : "var(--muted)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Todos
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id === selectedCat ? null : cat.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 100,
                fontSize: 12,
                border: "1px solid var(--border)",
                cursor: "pointer",
                background: selectedCat === cat.id ? "rgba(14,165,233,0.14)" : "transparent",
                color: selectedCat === cat.id ? "var(--cyan-l)" : "var(--muted)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? 10 : 18,
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(auto-fill, minmax(130px, 1fr))"
            : "repeat(auto-fill, minmax(168px, 1fr))",
          gap: isMobile ? 8 : 12,
          alignContent: "start",
        }}
      >
        {products.map((p: any) => (
          <button
            key={p.id}
            onClick={() => addToCart(p)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              overflow: "hidden",
              minHeight: isMobile ? 154 : 212,
              display: "flex",
              flexDirection: "column",
              color: "var(--text)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--cyan)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div
              style={{
                width: "100%",
                height: isMobile ? 76 : 112,
                background: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(16,185,129,0.10)), var(--bg2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--cyan-l)",
                fontFamily: "var(--font-display)",
                fontSize: isMobile ? 20 : 26,
                fontWeight: 850,
                flexShrink: 0,
                position: "relative",
              }}
            >
              {getProductInitials(p.name)}
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>
            <div style={{ padding: "8px 10px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
              <p
                style={{
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 750,
                  color: "var(--text)",
                  marginBottom: 3,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p.name}
              </p>
              <p style={{ fontSize: isMobile ? 13 : 15, fontWeight: 850, color: "var(--cyan)" }}>
                ${Number(p.price).toLocaleString("es-CL")}
              </p>
              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: "auto", paddingTop: 4 }}>
                Stock: {Number(p.stock)} {p.unit}
              </p>
            </div>
          </button>
        ))}
        {products.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "48px",
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            No se encontraron productos
          </div>
        )}
      </div>

      {!isMobile && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          {[
            ["F2", "Buscar"],
            ["F4", "Cobrar"],
            ["ESC", "Limpiar"],
          ].map(([key, label]) => (
            <span key={key} style={{ fontSize: 12, color: "var(--muted)" }}>
              <span
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                  color: "var(--text)",
                  marginRight: 4,
                }}
              >
                {key}
              </span>
              {label}
            </span>
          ))}
          <button
            onClick={() => {
              setShowHistory(true);
              loadHistory();
            }}
            style={{
              marginLeft: "auto",
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--muted)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Ventas del día
          </button>
        </div>
      )}
    </div>
  );
}

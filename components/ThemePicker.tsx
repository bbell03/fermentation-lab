"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_PRESETS, generateTheme, type LabTheme } from "@/lib/theme";

const MONO = "var(--font-dm-mono), monospace";
const BORD = "#161616";

type ThemePickerProps = {
  accent: string;
  onAccentChange: (hex: string) => void;
  theme: LabTheme;
};

export default function ThemePicker({ accent, onAccentChange, theme }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const activePreset = THEME_PRESETS.find((p) => p.hex.toUpperCase() === accent.toUpperCase());

  return (
    <div ref={rootRef} className="theme-picker" style={{ position: "fixed", top: 10, right: 10, zIndex: 100 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme spectrum"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 6px",
          background: open ? "rgba(12,12,12,0.95)" : "transparent",
          border: `1px solid ${open ? theme.accentDim : BORD}`,
          borderRadius: 4,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: open ? `0 0 20px ${theme.accentFaint}, inset 0 0 12px ${theme.accentFaint}` : "none",
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: `conic-gradient(from 210deg, ${theme.sensorColors.join(", ")}, ${theme.accent})`,
            boxShadow: `0 0 10px ${theme.accentGlow}`,
            border: `1px solid ${theme.accentDim}`,
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          className="theme-picker__panel"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 220,
            padding: "14px 14px 12px",
            background: "rgba(6,6,6,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${theme.accentDim}`,
            borderRadius: 6,
            boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 1px ${theme.accentSoft}, inset 0 1px 0 rgba(255,255,255,0.03)`,
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 8,
              letterSpacing: "0.2em",
              color: "#2a2a2a",
              textTransform: "uppercase",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Highlight</span>
            <span style={{ color: theme.accent }}>{accent.toUpperCase()}</span>
          </div>

          {/* Accent line preview */}
          <div
            style={{
              height: 2,
              marginBottom: 14,
              borderRadius: 1,
              background: `linear-gradient(90deg, ${theme.lineGradient.start}, ${theme.lineGradient.mid}, ${theme.lineGradient.end})`,
              boxShadow: `0 0 8px ${theme.accentSoft}`,
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {THEME_PRESETS.map((preset) => {
              const t = generateTheme(preset.hex);
              const active = preset.hex.toUpperCase() === accent.toUpperCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => {
                    onAccentChange(preset.hex);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    padding: "8px 4px",
                    background: active ? theme.accentFaint : "transparent",
                    border: `1px solid ${active ? theme.accentDim : "#141414"}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: preset.hex,
                      boxShadow: active ? `0 0 12px ${t.accentGlow}` : "none",
                      border: active ? `2px solid ${preset.hex}` : "2px solid transparent",
                      outline: active ? `1px solid ${theme.accentDim}` : "none",
                      outlineOffset: 2,
                    }}
                  />
                  <span style={{ fontFamily: MONO, fontSize: 7, color: active ? theme.accent : "#333", letterSpacing: "0.08em" }}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.16em", color: "#252525", textTransform: "uppercase", marginBottom: 8 }}>
            Environment map
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {theme.sensorColors.map((c, i) => (
              <div
                key={i}
                title={["Temp", "Humidity", "CO₂", "pH"][i]}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 1,
                  background: c,
                  boxShadow: `0 0 6px ${c}44`,
                }}
              />
            ))}
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              border: `1px solid ${BORD}`,
              borderRadius: 4,
              cursor: "pointer",
              background: "#0a0a0a",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: accent,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 14px ${theme.accentSoft}`,
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Custom input
            </span>
            <input
              type="color"
              value={accent}
              onChange={(e) => onAccentChange(e.target.value.toUpperCase())}
              style={{
                marginLeft: "auto",
                width: 32,
                height: 22,
                padding: 0,
                border: `1px solid ${BORD}`,
                borderRadius: 3,
                background: "transparent",
                cursor: "pointer",
              }}
            />
          </label>

          {activePreset && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#1e1e1e", textAlign: "center", marginTop: 10, letterSpacing: "0.12em" }}>
              {activePreset.label} · synced to dashboard
            </div>
          )}
        </div>
      )}
    </div>
  );
}

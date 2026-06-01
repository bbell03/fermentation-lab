"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  AreaChart, Area,
} from "recharts";
import {
  YEAST_TYPES,
  generateCurve,
  createDefaultSensors,
  tickSensors,
  type Sensor,
} from "@/lib/fermentation";
import { applySensorColors, generateTheme, type LabTheme } from "@/lib/theme";
import ThemePicker from "@/components/ThemePicker";
import ConsoleFeed from "@/components/ConsoleFeed";

type Alert = { time: string; msg: string; ok: boolean };

const DEFAULT_THEME = generateTheme("#C8F55A");
const INITIAL_SENSORS = applySensorColors(createDefaultSensors(), DEFAULT_THEME.sensorColors);

/* ─── Shared styles ─────────────────────────────────────────── */
const BG    = "#080808";
const BG2   = "#0d0d0d";
const BORD  = "#161616";
const TEXT  = "#e0e0e0";
const MUTED = "#3a3a3a";
const MONO  = "var(--font-dm-mono), monospace";

const TAB_SHORT: Record<string, string> = {
  curve: "Curve",
  sensors: "Env",
  console: "Console",
};

const tabBtn = (active: boolean) => ({
  fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em",
  textTransform: "uppercase", padding: "8px 20px",
  background: active ? "#141414" : "transparent",
  color: active ? TEXT : MUTED,
  border: "none", borderBottom: active ? "1px solid var(--lab-accent, #C8F55A)" : "1px solid transparent",
  cursor: "pointer", transition: "all 0.15s",
});

/* ─── Curve tooltip ─────────────────────────────────────────── */
const CurveTooltip = ({ active, payload, theme }: {
  active?: boolean;
  payload?: { payload: { hour: number; activity: number } }[];
  theme: LabTheme;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "rgba(10,10,10,0.95)", border: `1px solid ${BORD}`, padding: "8px 12px", borderRadius: 4, fontFamily: MONO, fontSize: 11, color: "#ccc" }}>
      <div style={{ color: TEXT, marginBottom: 2 }}>{d.hour}h</div>
      <div>activity <span style={{ color: theme.accent, marginLeft: 8 }}>{(d.activity * 100).toFixed(0)}%</span></div>
    </div>
  );
};

/* ─── Slider ────────────────────────────────────────────────── */
function Slider({ label, value, min, max, step, onChange, display, theme }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string; theme: LabTheme;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="lab-slider" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: TEXT }}>{display}</span>
      </div>
      <div className="lab-slider__hit">
        <div className="lab-slider__track" style={{ background: "#1a1a1a", borderRadius: 1 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: theme.accent, borderRadius: 1 }} />
          <div
            className="lab-slider__thumb"
            style={{ left: `calc(${pct}% - 5px)`, background: theme.accent }}
          />
        </div>
        <input
          type="range"
          className="lab-slider__input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          aria-label={label}
        />
      </div>
    </div>
  );
}

/* ─── Sensor mini-graph (Task-Manager style) ────────────────── */
function SensorGraph({ sensor }: { sensor: Sensor }) {
  const data   = sensor.history.map((p, i) => ({ i, v: p.v }));
  const cur    = sensor.history.length ? sensor.history[sensor.history.length - 1].v : sensor.base;
  const isLo   = cur < sensor.lo;
  const isHi   = cur > sensor.hi;
  const status = isLo || isHi ? "#F55A5A" : sensor.color;
  const pct    = Math.round(((cur - (sensor.lo - 4)) / ((sensor.hi + 4) - (sensor.lo - 4))) * 100);

  return (
    <div style={{ background: BG2, border: `1px solid ${BORD}`, borderRadius: 6, padding: "16px 16px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase", marginBottom: 4 }}>{sensor.label}</div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: status, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {cur.toFixed(sensor.unit === "pH" ? 2 : sensor.unit === "°C" ? 1 : 0)}
            <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>{sensor.unit}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: status, boxShadow: `0 0 6px ${status}66` }} />
          <div style={{ fontFamily: MONO, fontSize: 9, color: isLo || isHi ? "#F55A5A" : MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {isLo ? "low" : isHi ? "high" : "nominal"}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ height: 64, marginLeft: -4, marginRight: -4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${sensor.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sensor.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={sensor.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[sensor.lo - 4, sensor.hi + 4]} hide />
            <XAxis dataKey="i" hide />
            <ReferenceLine y={sensor.hi} stroke="#F55A5A" strokeDasharray="2 3" strokeOpacity={0.3} strokeWidth={0.5} />
            <ReferenceLine y={sensor.lo} stroke="#F55A5A" strokeDasharray="2 3" strokeOpacity={0.3} strokeWidth={0.5} />
            <Area type="monotone" dataKey="v" stroke={sensor.color} strokeWidth={1.5} fill={`url(#grad-${sensor.label})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Range bar */}
      <div style={{ position: "relative", height: 2, background: "#161616", borderRadius: 1 }}>
        <div style={{ position: "absolute", left: "15%", right: "15%", top: 0, height: "100%", background: `${sensor.color}22`, borderRadius: 1 }} />
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `calc(${Math.max(2, Math.min(98, pct))}% - 3px)`, width: 6, height: 6, borderRadius: "50%", background: status }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: "#222" }}>{sensor.lo}{sensor.unit}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: "#222" }}>{sensor.hi}{sensor.unit}</span>
      </div>
    </div>
  );
}

/* ─── Dashboard aggregate timeline ─────────────────────────── */
function AggTimeline({ sensors }: { sensors: Sensor[] }) {
  const len = Math.max(...sensors.map(s => s.history.length));
  if (len < 2) return null;

  const data = Array.from({ length: len }, (_, i) => {
    const row: Record<string, number> = { i };
    sensors.forEach(s => {
      const offset = len - s.history.length;
      const p = s.history[i - offset];
      if (p) {
        const norm = (p.v - s.lo) / (s.hi - s.lo);
        row[s.label] = +Math.max(0, Math.min(1, norm)).toFixed(3);
      }
    });
    return row;
  });

  return (
    <div style={{ background: BG2, border: `1px solid ${BORD}`, borderRadius: 6, padding: "16px 16px 10px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase", marginBottom: 12 }}>Normalized Timeline</div>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 1]} hide />
            {sensors.map(s => (
              <Line key={s.label} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={1} dot={false} isAnimationActive={false} />
            ))}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: "rgba(10,10,10,0.95)", border: `1px solid ${BORD}`, padding: "8px 12px", borderRadius: 4, fontFamily: MONO, fontSize: 10 }}>
                    {payload.map(p => (
                      <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 2 }}>
                        {p.dataKey}: {(Number(p.value) * 100).toFixed(0)}%
                      </div>
                    ))}
                  </div>
                );
              }}
              cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {sensors.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 2, background: s.color, borderRadius: 1 }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Alert log ─────────────────────────────────────────────── */
function AlertLog({ alerts }: { alerts: Alert[] }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${BORD}`, borderRadius: 6, padding: "16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase", marginBottom: 12 }}>Event Log</div>
      {alerts.length === 0 && (
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#222", textAlign: "center", padding: "12px 0" }}>No events</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
        {alerts.slice().reverse().map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#252525", whiteSpace: "nowrap" }}>{a.time}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: a.ok ? "#3a3a3a" : "#F55A5A" }}>{a.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function FermentationLab() {
  const [tab, setTab] = useState("curve");
  const [accent, setAccent] = useState("#C8F55A");
  const theme = useMemo(() => generateTheme(accent), [accent]);

  /* curve state */
  const [flourProtein, setFlourProtein] = useState(12.5);
  const [yeastType,    setYeastType]    = useState("instant");
  const [tempC,        setTempC]        = useState(22);
  const [hours,        setHours]        = useState(24);
  const [scrubX,       setScrubX]       = useState<number | null>(null);

  /* sensor state */
  const [sensors, setSensors]   = useState<Sensor[]>(INITIAL_SENSORS);
  const [alerts,  setAlerts]    = useState<Alert[]>([]);
  const [tick,    setTick]      = useState(0);
  const [paused,  setPaused]    = useState(false);

  useEffect(() => {
    setSensors((prev) => applySensorColors(prev, theme.sensorColors));
  }, [theme.sensorColors]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setSensors((prev) => tickSensors(prev));
      setTick((t) => t + 1);
    }, 800);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (paused || tick === 0) return;
    const now = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setAlerts((al) => {
      let next = al;
      sensors.forEach((s) => {
        const cur = s.history[s.history.length - 1]?.v ?? s.base;
        if (cur > s.hi || cur < s.lo) {
          const msg = `${s.label} ${cur > s.hi ? "HIGH" : "LOW"}: ${cur.toFixed(2)}${s.unit}`;
          if (!next.length || next[next.length - 1].msg !== msg) {
            next = [...next.slice(-19), { time: now, msg, ok: false }];
          }
        }
      });
      return next;
    });
  }, [tick, paused, sensors]);

  const { points, peakTime, peakHeight, lag } = generateCurve(flourProtein, yeastType, tempC, hours);

  const scrubPoint = scrubX !== null
    ? points.reduce((p, c) => Math.abs(c.hour - scrubX) < Math.abs(p.hour - scrubX) ? c : p, points[0])
    : null;

  const handleChartMove = useCallback((state: { activeLabel?: string | number }) => {
    if (state?.activeLabel != null) setScrubX(Number(state.activeLabel));
  }, []);
  const tempF = Math.round(tempC * 9 / 5 + 32);

  /* summary stats for dashboard header */
  const curVals = sensors.map(s => s.history.length ? s.history[s.history.length - 1].v : s.base);
  const outOfRange = sensors.filter((s, i) => curVals[i] < s.lo || curVals[i] > s.hi).length;

  return (
    <div
      className="lab-root"
      style={{
        width: "100vw",
        height: "100vh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ["--lab-accent" as string]: theme.accent,
      }}
    >
      {/* Tab bar */}
      <div
        className="lab-header"
        style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${BORD}`, padding: "0 24px", gap: 4, flexShrink: 0 }}
      >
        <div
          className="lab-header__brand"
          style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", color: "#222", textTransform: "uppercase", marginRight: 16, paddingTop: 2 }}
        >
          Fermentation Lab
        </div>
        <nav className="lab-header__nav" role="tablist" aria-label="Views">
          {[["curve", "Activity Curve"], ["sensors", "Environment"], ["console", "Console Feed"]].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`lab-tab${tab === id ? " lab-tab--active" : ""}`}
              onClick={() => setTab(id)}
              style={tabBtn(tab === id)}
            >
              <span className="lab-tab__label--full">{label}</span>
              <span className="lab-tab__label--short">{TAB_SHORT[id]}</span>
            </button>
          ))}
        </nav>
        {(tab === "sensors" || tab === "console") && (
          <div className="lab-header__actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, paddingRight: 44 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: outOfRange > 0 ? "#F55A5A" : "#2a2a2a", letterSpacing: "0.1em" }}>
              {outOfRange > 0 ? `${outOfRange} ALERT${outOfRange > 1 ? "S" : ""}` : "ALL NOMINAL"}
            </div>
            <button type="button" onClick={() => setPaused(p => !p)} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", background: "transparent", border: `1px solid ${BORD}`, color: paused ? theme.accent : MUTED, borderRadius: 3, padding: "4px 10px", cursor: "pointer" }}>
              {paused ? "RESUME" : "PAUSE"}
            </button>
          </div>
        )}
      </div>

      <ThemePicker accent={accent} onAccentChange={setAccent} theme={theme} />

      {/* ── CURVE TAB ── */}
      {tab === "curve" && (
        <div className="lab-curve-layout" style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr", overflow: "hidden" }}>
          {/* Sidebar */}
          <div className="lab-curve-sidebar" style={{ padding: "36px 24px", borderRight: `1px solid ${BORD}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Yeast type */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase", marginBottom: 10 }}>Yeast Type</div>
              <div className="lab-yeast-grid" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {YEAST_TYPES.map(y => (
                  <button key={y.id} onClick={() => setYeastType(y.id)} style={{ background: yeastType === y.id ? theme.accentFaint : "transparent", border: `1px solid ${yeastType === y.id ? theme.accentDim : "#181818"}`, borderRadius: 3, padding: "7px 10px", cursor: "pointer", textAlign: "left", fontFamily: MONO, fontSize: 11, color: yeastType === y.id ? theme.accent : "#333", transition: "all 0.12s" }}>
                    {y.label}
                  </button>
                ))}
              </div>
            </div>
            <Slider label="Flour Protein" value={flourProtein} min={8} max={16} step={0.1} onChange={setFlourProtein} display={`${flourProtein.toFixed(1)}%`} theme={theme} />
            <Slider label="Temperature"   value={tempC}        min={4} max={38} step={0.5} onChange={setTempC}        display={`${tempC}°C / ${tempF}°F`} theme={theme} />
            <Slider label="Time Window"   value={hours}        min={6} max={72} step={2}   onChange={setHours}        display={`${hours}h`} theme={theme} />
            <div className="lab-curve-stats" style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${BORD}` }}>
              {[["Lag Phase", `${lag}h`], ["Peak Activity", `${(peakHeight * 100).toFixed(0)}%`], ["Peak Time", `${peakTime}h`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "#252525", letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#666" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="lab-curve-chart" style={{ position: "relative", display: "flex", flexDirection: "column", padding: "36px 32px 36px 12px" }}>
            <div className="lab-curve-scrub" style={{ position: "absolute", top: 36, right: 32, fontFamily: MONO, textAlign: "right", opacity: scrubPoint ? 1 : 0, transition: "opacity 0.15s" }}>
              <div className="lab-curve-scrub__value" style={{ fontSize: 36, color: theme.accent, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {scrubPoint ? `${(scrubPoint.activity * 100).toFixed(0)}%` : "—"}
              </div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{scrubPoint ? `at ${scrubPoint.hour}h` : ""}</div>
            </div>
            <div className="lab-curve-chart__plot" style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={points}
                  onMouseMove={handleChartMove}
                  onMouseLeave={() => setScrubX(null)}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={theme.accent} stopOpacity={0.25} />
                      <stop offset="40%"  stopColor={theme.accent} stopOpacity={1} />
                      <stop offset="100%" stopColor={theme.accent} stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" type="number" domain={[0, hours]} tickCount={Math.min(hours / 2 + 1, 13)} tick={{ fontFamily: MONO, fontSize: 9, fill: "#232323" }} axisLine={{ stroke: "#111" }} tickLine={false} tickFormatter={v => v % 4 === 0 ? `${v}h` : ""} />
                  <YAxis domain={[0, 3.2]} tick={{ fontFamily: MONO, fontSize: 9, fill: "#232323" }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? "" : `${Math.round(v * 100)}%`} width={38} />
                  <Tooltip content={<CurveTooltip theme={theme} />} cursor={{ stroke: "rgba(255,255,255,0.04)", strokeWidth: 1 }} />
                  <ReferenceLine x={lag}      stroke="#1a1a1a" strokeDasharray="3 3" />
                  <ReferenceLine x={peakTime} stroke={theme.accentSoft} strokeDasharray="2 4" />
                  {scrubX !== null && <ReferenceLine x={scrubX} stroke={theme.accentDim} strokeWidth={1} />}
                  <Line type="monotone" dataKey="activity" stroke="url(#lineGrad)" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: theme.accent, strokeWidth: 0 }} animationDuration={500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="lab-curve-footer" style={{ display: "flex", gap: 20, paddingLeft: 16, paddingTop: 12, borderTop: `1px solid #0d0d0d` }}>
              <span className="lab-curve-footer__hint lab-curve-footer__hint--hover" style={{ fontFamily: MONO, fontSize: 9, color: "#1e1e1e" }}>HOVER TO SCRUB</span>
              <span className="lab-curve-footer__hint lab-curve-footer__hint--touch" style={{ fontFamily: MONO, fontSize: 9, color: "#1e1e1e" }}>DRAG TO SCRUB</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: "#1e1e1e" }}>{YEAST_TYPES.find(y => y.id === yeastType)?.label.toUpperCase()} · {flourProtein}% PROTEIN · {tempC}°C</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SENSORS TAB ── */}
      {tab === "sensors" && (
        <div className="lab-sensors-layout" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 260px", overflow: "hidden" }}>
          {/* Main sensor grid */}
          <div className="lab-sensors-main" style={{ overflowY: "auto", padding: "24px 20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header stat row */}
            <div className="lab-sensors-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {sensors.map((s, i) => {
                const cur = curVals[i];
                const ok  = cur >= s.lo && cur <= s.hi;
                return (
                  <div key={s.label} style={{ background: BG2, border: `1px solid ${ok ? BORD : "#2a1010"}`, borderRadius: 5, padding: "12px 14px" }}>
                    <div style={{ fontFamily: MONO, fontSize: 8, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                    <div className="lab-stat-value" style={{ fontFamily: MONO, fontSize: 20, color: ok ? s.color : "#F55A5A", fontWeight: 300 }}>
                      {cur.toFixed(s.unit === "pH" ? 2 : s.unit === "°C" ? 1 : 0)}<span style={{ fontSize: 10, color: MUTED, marginLeft: 3 }}>{s.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2×2 sensor graphs */}
            <div className="lab-sensors-graphs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sensors.map(s => <SensorGraph key={s.label} sensor={s} />)}
            </div>

            {/* Aggregate timeline */}
            <AggTimeline sensors={sensors} />
          </div>

          {/* Right column */}
          <div className="lab-sensors-sidebar" style={{ borderLeft: `1px solid ${BORD}`, padding: "24px 20px 24px 16px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
            {/* Tick counter */}
            <div style={{ background: BG2, border: `1px solid ${BORD}`, borderRadius: 5, padding: "14px 14px" }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Uptime</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: TEXT, fontWeight: 300 }}>{tick}<span style={{ fontSize: 10, color: MUTED, marginLeft: 4 }}>ticks</span></div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: MUTED, marginTop: 4 }}>0.8s interval</div>
            </div>

            {/* Thresholds */}
            <div style={{ background: BG2, border: `1px solid ${BORD}`, borderRadius: 5, padding: "14px" }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Thresholds</div>
              {sensors.map((s, i) => {
                const cur = curVals[i];
                const ok  = cur >= s.lo && cur <= s.hi;
                const pct = Math.max(0, Math.min(100, ((cur - s.lo) / (s.hi - s.lo)) * 100));
                return (
                  <div key={s.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "#2a2a2a", textTransform: "uppercase" }}>{s.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: ok ? s.color : "#F55A5A" }}>{ok ? "OK" : "!"}</span>
                    </div>
                    <div style={{ position: "relative", height: 2, background: "#141414", borderRadius: 1 }}>
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: ok ? s.color : "#F55A5A", borderRadius: 1, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: "#1e1e1e" }}>{s.lo}</span>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: "#1e1e1e" }}>{s.hi}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alert log */}
            <AlertLog alerts={alerts} />
          </div>
        </div>
      )}

      {/* ── CONSOLE FEED TAB ── */}
      {tab === "console" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <ConsoleFeed sensors={sensors} tick={tick} paused={paused} />
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { Sensor } from "@/lib/fermentation";

const MONO = "var(--font-dm-mono), monospace";
const MAX_LINES = 320;

const TAGS: Record<string, string> = {
  Temperature: "TMP",
  Humidity: "HUM",
  "CO₂": "CO2",
  pH: "PH",
};

type FeedLine = {
  id: number;
  time: string;
  tag: string;
  channel: string;
  value: string;
  status: "nominal" | "low" | "high";
  color: string;
};

function formatValue(sensor: Sensor, v: number): string {
  const n = sensor.unit === "pH" ? 2 : sensor.unit === "°C" ? 1 : 0;
  return `${v.toFixed(n)}${sensor.unit}`;
}

function tagStyle(color: string, status: FeedLine["status"]) {
  const muted = status !== "nominal";
  const hex = color.startsWith("#") ? color : `#${color}`;
  return {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: "0.12em",
    padding: "2px 6px",
    borderRadius: 2,
    color: muted ? "#F55A5A" : hex,
    background: muted ? "rgba(245, 90, 90, 0.08)" : `${hex}1a`,
    border: muted ? "1px solid rgba(245, 90, 90, 0.2)" : `1px solid ${hex}30`,
    opacity: muted ? 0.95 : 0.72,
    flexShrink: 0,
  } as const;
}

function buildBatch(sensors: Sensor[], tick: number, time: string, nextId: () => number): FeedLine[] {
  return sensors.map((s) => {
    const cur = s.history.length ? s.history[s.history.length - 1].v : s.base;
    const isLo = cur < s.lo;
    const isHi = cur > s.hi;
    return {
      id: nextId(),
      time,
      tag: TAGS[s.label] ?? s.label.slice(0, 3).toUpperCase(),
      channel: s.label.toLowerCase(),
      value: formatValue(s, cur),
      status: (isLo ? "low" : isHi ? "high" : "nominal") as FeedLine["status"],
      color: s.color,
    };
  });
}

type ConsoleFeedProps = {
  sensors: Sensor[];
  tick: number;
  paused: boolean;
};

export default function ConsoleFeed({ sensors, tick, paused }: ConsoleFeedProps) {
  const [lines, setLines] = useState<FeedLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTickRef = useRef(0);
  const lineIdRef = useRef(0);
  const sensorsRef = useRef(sensors);

  sensorsRef.current = sensors;

  useEffect(() => {
    if (paused || tick === 0 || tick === lastTickRef.current) return;
    lastTickRef.current = tick;

    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const batch = buildBatch(sensorsRef.current, tick, time, () => ++lineIdRef.current);

    setLines((prev) => [...prev, ...batch].slice(-MAX_LINES));
  }, [tick, paused]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [lines]);

  return (
    <div
      ref={scrollRef}
      className="console-feed"
      style={{
        flex: 1,
        overflow: "auto",
        padding: "20px 24px 28px",
        fontFamily: MONO,
        fontSize: 11,
        lineHeight: 1.65,
        background: "#060606",
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "#1a1a1a",
          textTransform: "uppercase",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #0e0e0e",
        }}
      >
        env_stream · {paused ? "paused" : "live"} · tick {tick}
      </div>

      {lines.length === 0 && (
        <div style={{ color: "#1e1e1e", fontSize: 10, letterSpacing: "0.1em" }}>
          awaiting telemetry…
        </div>
      )}

      {lines.map((line) => (
        <div
          key={line.id}
          className="console-feed__line"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            padding: "3px 0",
            color: "#2a2a2a",
          }}
        >
          <span className="console-feed__time" style={{ color: "#181818", fontSize: 10, width: 58, flexShrink: 0 }}>{line.time}</span>
          <span style={tagStyle(line.color, line.status)}>{line.tag}</span>
          <span className="console-feed__channel" style={{ color: "#222", fontSize: 9, width: 72, flexShrink: 0, letterSpacing: "0.06em" }}>
            {line.channel}
          </span>
          <span
            style={{
              color: line.status === "nominal" ? "#444" : "#F55A5A",
              fontWeight: 300,
              minWidth: 72,
            }}
          >
            {line.value}
          </span>
          <span
            style={{
              fontSize: 8,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: line.status === "nominal" ? "#1a1a1a" : "#3a2020",
            }}
          >
            {line.status}
          </span>
        </div>
      ))}
    </div>
  );
}

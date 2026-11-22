"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

// 用容器實際寬度當 viewBox 寬度，圖表文字在手機和寬螢幕都維持原本大小
function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const H = 230;
const M = { l: 40, r: 40, t: 26, b: 28 };
const PH = H - M.t - M.b;
type Dims = { W: number; PW: number };
const dims = (W: number): Dims => ({ W, PW: W - M.l - M.r });

function niceTicks(max: number, count = 4) {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step || step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(+v.toFixed(4));
  return { top, ticks };
}

function fmt(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function useHover(n: number, mode: "band" | "point", { W, PW }: Dims) {
  const [idx, setIdx] = useState<number | null>(null);
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W - M.l;
    const i = mode === "band" ? Math.floor((x / PW) * n) : Math.round((x / PW) * (n - 1));
    setIdx(i >= 0 && i < n ? i : null);
  };
  return { idx, onMove, onLeave: () => setIdx(null) };
}

function Tooltip({ leftPct, children }: { leftPct: number; children: React.ReactNode }) {
  const clamped = Math.min(88, Math.max(12, leftPct));
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 min-w-28 -translate-x-1/2 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg"
      style={{ left: `${clamped}%` }}
    >
      {children}
    </div>
  );
}

function Grid({ ticks, top, unit, W }: { ticks: number[]; top: number; unit: string; W: number }) {
  return (
    <g>
      {ticks.map((t) => {
        const y = M.t + PH - (t / top) * PH;
        return (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y} y2={y} stroke={t === 0 ? "var(--axis)" : "var(--grid)"} strokeWidth={1} />
            <text x={M.l - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--muted)" className="tabular">
              {fmt(t)}
            </text>
          </g>
        );
      })}
      <text x={4} y={12} fontSize={11} fill="var(--muted)">
        {unit}
      </text>
    </g>
  );
}

function XLabels({ labels, xAt, every = 1 }: { labels: string[]; xAt: (i: number) => number; every?: number }) {
  return (
    <g>
      {labels.map((l, i) =>
        (i % every === 0 && labels.length - 1 - i >= every) || i === labels.length - 1 ? (
          <text key={l} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--muted)" className="tabular">
            {l}
          </text>
        ) : null,
      )}
    </g>
  );
}

export function BarChart({ labels, values, unit, color, name, width = 640 }: { labels: string[]; values: number[]; unit: string; color: string; name: string; width?: number }) {
  const [ref, w] = useWidth(width);
  const d = dims(w);
  const { W, PW } = d;
  const n = values.length;
  const { top, ticks } = niceTicks(Math.max(...values) * 1.1);
  const band = PW / n;
  const bw = Math.max(6, band - 6);
  const xAt = (i: number) => M.l + band * i + band / 2;
  const { idx, onMove, onLeave } = useHover(n, "band", d);

  return (
    <div className="relative" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" onPointerMove={onMove} onPointerLeave={onLeave} role="img" aria-label={`${name}長條圖`}>
        <Grid ticks={ticks} top={top} unit={unit} W={W} />
        {idx !== null && <rect x={M.l + band * idx} y={M.t} width={band} height={PH} fill="var(--surface-2)" />}
        {values.map((v, i) => {
          const h = (v / top) * PH;
          const x = xAt(i) - bw / 2;
          const y = M.t + PH - h;
          const r = Math.min(4, h, bw / 2);
          return v > 0 ? (
            <path
              key={i}
              d={`M${x},${M.t + PH} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${M.t + PH} Z`}
              fill={color}
              opacity={idx === null || idx === i ? 1 : 0.45}
            />
          ) : null;
        })}
        <XLabels labels={labels} xAt={xAt} every={n > 10 ? (W < 560 ? 3 : 2) : 1} />
      </svg>
      {idx !== null && (
        <Tooltip leftPct={(xAt(idx) / W) * 100}>
          <div className="font-bold">{labels[idx]}</div>
          <div className="mt-0.5 flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
            {name}
            <span className="ml-auto font-bold text-ink tabular">
              {fmt(values[idx])} {unit}
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

export function LineChart({
  labels,
  series,
  unit,
  max,
  threshold,
  width = 640,
}: {
  labels: string[];
  series: { name: string; short: string; color: string; values: number[] }[];
  unit: string;
  max?: number;
  threshold?: { value: number; label: string };
  width?: number;
}) {
  const [ref, w] = useWidth(width);
  const d = dims(w);
  const { W, PW } = d;
  const n = labels.length;
  const { top, ticks } = niceTicks(max ?? Math.max(...series.flatMap((s) => s.values)) * 1.1);
  const xAt = (i: number) => M.l + (PW * i) / (n - 1);
  const yAt = (v: number) => M.t + PH - (v / top) * PH;
  const { idx, onMove, onLeave } = useHover(n, "point", d);

  // 直接標籤：避免互相重疊
  const ends = series
    .map((s) => ({ s, y: yAt(s.values[n - 1]) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13;

  return (
    <div className="relative" ref={ref}>
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {series.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" onPointerMove={onMove} onPointerLeave={onLeave} role="img" aria-label="折線圖">
        <Grid ticks={ticks} top={top} unit={unit} W={W} />
        {threshold && (
          <g>
            <line x1={M.l} x2={W - M.r} y1={yAt(threshold.value)} y2={yAt(threshold.value)} stroke="var(--muted)" strokeDasharray="4 4" strokeWidth={1} />
            <text x={M.l + 4} y={yAt(threshold.value) - 5} fontSize={10.5} fill="var(--muted)" stroke="var(--surface)" strokeWidth={4} paintOrder="stroke">
              {threshold.label}
            </text>
          </g>
        )}
        {idx !== null && <line x1={xAt(idx)} x2={xAt(idx)} y1={M.t} y2={M.t + PH} stroke="var(--axis)" strokeWidth={1} />}
        {series.map((s) => (
          <polyline
            key={s.name}
            points={s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {idx !== null &&
          series.map((s) => <circle key={s.name} cx={xAt(idx)} cy={yAt(s.values[idx])} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />)}
        {series.length > 1 &&
          ends.map(({ s, y }) => (
            <text key={s.name} x={W - M.r + 6} y={y + 4} fontSize={11} fontWeight={700} fill="var(--ink)">
              {s.short}
            </text>
          ))}
        <XLabels labels={labels} xAt={xAt} every={n > 10 ? (W < 560 ? 3 : 2) : 1} />
      </svg>
      {idx !== null && (
        <Tooltip leftPct={(xAt(idx) / W) * 100}>
          <div className="font-bold">{labels[idx]}</div>
          {[...series]
            .sort((a, b) => b.values[idx] - a.values[idx])
            .map((s) => (
              <div key={s.name} className="mt-0.5 flex items-center gap-2 text-muted">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                {s.name}
                <span className="ml-auto pl-3 font-bold text-ink tabular">
                  {fmt(s.values[idx])} {unit}
                </span>
              </div>
            ))}
        </Tooltip>
      )}
    </div>
  );
}


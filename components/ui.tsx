import type { ReactNode } from "react";
import type { Level } from "@/lib/mock";
import { IconAlert, IconCheck, IconInfo } from "./icons";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

const levelStyle: Record<Level, { color: string; label: string; Icon: typeof IconAlert }> = {
  good: { color: "text-good", label: "正常", Icon: IconCheck },
  warn: { color: "text-warn", label: "注意", Icon: IconInfo },
  serious: { color: "text-serious", label: "異常", Icon: IconAlert },
  crit: { color: "text-crit", label: "緊急", Icon: IconAlert },
};

export function LevelTag({ level }: { level: Level }) {
  const s = levelStyle[level];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${s.color}`}>
      <s.Icon width={16} height={16} />
      {s.label}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "water" | "fert" | "crit" }) {
  const tones = {
    neutral: "bg-surface-2 text-muted",
    brand: "bg-brand-soft text-brand",
    water: "bg-water-soft text-water",
    fert: "bg-fert-soft text-fert",
    crit: "bg-crit-soft text-crit",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function OnOff({ on, onText = "運轉中", offText = "停止" }: { on: boolean; onText?: string; offText?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${on ? "text-brand" : "text-muted"}`}>
      <span className={`h-2 w-2 rounded-full ${on ? "bg-brand animate-pulse" : "bg-line"}`} />
      {on ? onText : offText}
    </span>
  );
}

export function Bar({ pct, color = "var(--brand)", warnBelow }: { pct: number; color?: string; warnBelow?: number }) {
  const c = warnBelow !== undefined && pct < warnBelow ? "var(--warn)" : color;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: c }} />
    </div>
  );
}

export function Switch({ on, label, disabled }: { on: boolean; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40 ${on ? "bg-brand" : "bg-line"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";

export function btnClass(variant: Variant = "primary", className = "") {
  const v = {
    primary: "bg-brand text-white hover:opacity-90",
    secondary: "border border-line bg-surface text-ink hover:bg-surface-2",
    danger: "bg-crit text-white hover:opacity-90",
    ghost: "text-brand hover:bg-brand-soft",
  };
  return `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${v[variant]} ${className}`;
}

export function Button({ children, variant = "primary", className = "" }: { children: ReactNode; variant?: Variant; className?: string }) {
  return (
    <button type="button" className={btnClass(variant, className)}>
      {children}
    </button>
  );
}

export function ZoneBadge({ id, size = "md" }: { id: string; size?: "md" | "lg" }) {
  const color = { A: "var(--s1)", B: "var(--s2)", C: "var(--s3)", D: "var(--s4)" }[id] ?? "var(--muted)";
  const sz = size === "lg" ? "h-10 w-10 text-base" : "h-7 w-7 text-sm";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-white ${sz}`} style={{ background: color, color: id === "D" ? "#0b0b0b" : "#fff" }}>
      {id}
    </span>
  );
}

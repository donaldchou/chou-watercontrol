import { Bar, Card, LevelTag, PageHeader, Pill, ZoneBadge } from "@/components/ui";
import { IconClock, IconSignal } from "@/components/icons";
import { SiteEnter } from "@/components/SiteEnter";
import { sites, type Level, type Site } from "@/lib/mock";

const LEVEL_RANK: Record<Level, number> = { crit: 0, serious: 1, warn: 2, good: 3 };

/** 需要處理的排前面：離線 → 有嚴重告警 → 有提醒 → 灌溉中 → 待機 */
function rank(s: Site) {
  const worst = Math.min(4, ...s.alerts.map((a) => LEVEL_RANK[a.level]));
  return (s.online ? 10 : 0) + worst * 10 + (s.status === "irrigating" ? 0 : 1);
}

const STATUS = {
  irrigating: { tone: "water", label: "灌溉中" },
  idle: { tone: "neutral", label: "待機" },
  offline: { tone: "crit", label: "離線" },
} as const;

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface px-2 py-2.5 text-center sm:px-4 sm:py-3 sm:text-left">
      <div className="truncate text-xs text-muted">{label}</div>
      <div className={`text-xl font-bold tabular sm:text-2xl ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={`font-bold tabular ${warn ? "text-warn" : ""}`}>{value}</div>
    </div>
  );
}

export default function SitesPage() {
  const list = [...sites].sort((a, b) => rank(a) - rank(b));
  const online = sites.filter((s) => s.online).length;
  const needAttention = sites.filter((s) => !s.online || s.alerts.some((a) => a.level !== "good")).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="所有案場" desc="每個控制箱目前的狀態，需要處理的排在前面。資料每 60 秒更新一次。" />

      <p className="rounded-xl border border-dashed border-line px-4 py-2.5 text-sm text-muted">
        目前只有「中心路_1」會裝控制箱；其他三個案場是示意，用來看多個案場時的版面。
      </p>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        <Stat label="案場" value={sites.length} />
        <Stat label="連線中" value={online} tone="text-good" />
        <Stat label="離線" value={sites.length - online} tone={sites.length - online ? "text-crit" : ""} />
        <Stat label="灌溉中" value={sites.filter((s) => s.status === "irrigating").length} tone="text-water" />
        <Stat label="需要注意" value={needAttention} tone={needAttention ? "text-warn" : ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((s) => {
          const st = STATUS[s.status];
          const pct = s.progress ? Math.round((s.progress.elapsedMin / s.progress.totalMin) * 100) : 0;
          return (
            <Card key={s.id} className={`flex flex-col gap-4 ${s.online ? "" : "border-crit/40"}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{s.name}</h2>
                    {s.example && <span className="rounded border border-line px-1.5 text-xs text-muted">示意</span>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <IconSignal bars={s.signalBars} />
                    最後回報 {s.lastReport}
                  </div>
                </div>
                <Pill tone={st.tone}>{st.label}</Pill>
              </div>

              <div className={`rounded-xl px-3 py-2.5 ${s.status === "irrigating" ? "bg-water-soft" : "bg-surface-2"}`}>
                {s.progress ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ZoneBadge id={s.progress.zone} />
                      <span className="font-medium">
                        {s.progress.zone} 區・{s.progress.step}
                      </span>
                      <span className="ml-auto text-xs text-muted tabular">
                        {s.progress.elapsedMin} / {s.progress.totalMin} 分
                      </span>
                    </div>
                    <Bar pct={pct} color="var(--water)" />
                    <div className="text-xs text-muted">{s.activity}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted">{s.activity}</div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">
                <Metric label="水壓" value={s.pressure === null ? "—" : `${s.pressure} kg`} warn={s.pressure !== null && s.pressure > 0 && s.pressure < 1.2} />
                <Metric label="蓄水桶" value={`${s.waterTankPct}%`} warn={s.waterTankPct < 35} />
                <Metric label="肥料桶" value={`${s.fertTankPct}%`} warn={s.fertTankPct < 45} />
                <Metric label="今日用水" value={`${s.todayWaterM3} 噸`} />
              </div>

              {s.alerts.length > 0 && (
                <ul className="flex flex-col gap-1.5 border-t border-line pt-3">
                  {s.alerts.map((a) => (
                    <li key={a.text} className="flex items-center gap-2 text-sm">
                      <LevelTag level={a.level} />
                      <span className="min-w-0">{a.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-3">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
                  <IconClock width={14} height={14} />
                  下次：{s.next}
                </span>
                <span className="ml-auto">
                  <SiteEnter id={s.id} example={s.example} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { btnClass, Card, PageHeader, Pill, Switch, ZoneBadge } from "@/components/ui";
import { IconChevron, IconClock, IconPlus } from "@/components/icons";
import { schedules, weekday } from "@/lib/mock";

const kindTone = { 液肥: "fert", 氮肥: "fert", 清水: "water" } as const;

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="排程"
        desc="排程會同步到控制箱，斷網時也照常執行。"
        action={
          <Link href="/schedule/edit" className={btnClass()}>
            <IconPlus width={18} height={18} />
            新增排程
          </Link>
        }
      />

      {/* 季節模式 */}
      <Card>
        <div className="mb-3 text-sm font-medium">肥料桶目前裝的是</div>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1">
          <button type="button" className="rounded-lg bg-surface py-2.5 text-sm font-bold text-fert shadow-sm">
            採收季液肥
          </button>
          <button type="button" className="rounded-lg py-2.5 text-sm font-medium text-muted">
            平時液態氮肥
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">換肥後記得切換，系統只會執行跟目前肥料相符的施肥排程。「平時氮肥」排程目前暫停中。</p>
      </Card>

      <div className="flex flex-col gap-3">
        {schedules.map((s) => {
          const total = s.zones.reduce((a, z) => a + z.min, 0) + (s.flushMin ? s.flushMin * s.zones.length : 0);
          return (
            <Card key={s.id} className={s.enabled ? "" : "opacity-60"}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold">{s.name}</h2>
                    <Pill tone={kindTone[s.kind]}>{s.kind}</Pill>
                    {!s.enabled && <Pill>暫停中</Pill>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-bold">
                      <IconClock width={16} height={16} className="text-muted" />
                      {s.time}
                    </span>
                    <span className="flex gap-1">
                      {weekday.map((d, i) => (
                        <span
                          key={d}
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${s.days.includes(i) ? "bg-brand text-white" : "bg-surface-2 text-muted"}`}
                        >
                          {d}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                <Switch on={s.enabled} label={`${s.name} 啟用`} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {s.zones.map((z, i) => (
                  <span key={z.id} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line py-1 pl-1 pr-2.5 text-sm">
                      <ZoneBadge id={z.id} />
                      <span className="tabular">{z.min} 分</span>
                    </span>
                    {i < s.zones.length - 1 && <IconChevron width={14} height={14} className="text-muted" />}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-3 text-xs text-muted">
                <span>注肥：{s.fert}</span>
                {s.flushMin > 0 && <span>每區清水沖管 {s.flushMin} 分</span>}
                <span>濕度 ≥ {s.skipMoisture}% 略過</span>
                <span>全程約 {total} 分</span>
                <Link href="/schedule/edit" className="ml-auto font-medium text-brand">
                  編輯
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

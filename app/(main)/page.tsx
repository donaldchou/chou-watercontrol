import Link from "next/link";
import { OrchardName } from "@/components/OrchardPicker";
import { Bar, Card, CardTitle, LevelTag, OnOff, Pill, ZoneBadge } from "@/components/ui";
import { IconChevron, IconClock, IconDrop, IconFlask, IconFlow, IconGauge } from "@/components/icons";
import { alerts, controller, currentRun, devices, moistureSkip, nextRun, sensors, zones } from "@/lib/mock";

function Metric({
  icon,
  label,
  value,
  unit,
  sub,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      {children}
      <div className="text-xs text-muted">{sub}</div>
    </Card>
  );
}

const statusTone = { running: "water", done: "brand", waiting: "neutral", skipped: "neutral" } as const;

export default function Overview() {
  const runPct = Math.round((currentRun.elapsedMin / currentRun.totalMin) * 100);
  const fertPct = Math.round((currentRun.fertGivenL / currentRun.fertTargetL) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            11 月 21 日（六）・<OrchardName />
          </p>
          <h1 className="text-2xl font-bold">果園總覽</h1>
        </div>
        <Pill tone="fert">
          <IconFlask width={14} height={14} />
          目前模式：{controller.mode}
        </Pill>
      </div>

      {/* 目前灌溉進度 */}
      <section className="overflow-hidden rounded-2xl bg-brand text-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold">{currentRun.zone}</span>
            <div>
              <div className="text-sm text-white/80">{currentRun.scheduleName}</div>
              <div className="text-xl font-bold">B 區灌溉中・{currentRun.step}</div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>灌溉時間</span>
                <span className="tabular">
                  {currentRun.elapsedMin} / {currentRun.totalMin} 分
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${runPct}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>已注肥</span>
                <span className="tabular">
                  {currentRun.fertGivenL} / {currentRun.fertTargetL} 公升
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20">
                <div className="h-full rounded-full bg-[#f6c453]" style={{ width: `${fertPct}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 bg-black/10 px-5 py-3 text-xs">
          {currentRun.steps.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`rounded-full px-2 py-0.5 ${i < currentRun.stepIndex ? "bg-white/25" : i === currentRun.stepIndex ? "bg-white font-bold text-brand" : "text-white/70"}`}>{s}</span>
              {i < currentRun.steps.length - 1 && <IconChevron width={12} height={12} className="opacity-60" />}
            </span>
          ))}
          <span className="ml-auto text-white/80">接著：{currentRun.queue.join("、")} 區</span>
        </div>
      </section>

      {/* 即時數值 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<IconGauge width={18} height={18} />} label="水壓" value={String(sensors.pressure)} unit="kg/cm²" sub={`低於 ${sensors.pressureMin} 自動停機`} />
        <Metric icon={<IconFlow width={18} height={18} />} label="流量" value={String(sensors.flow)} unit="L/分" sub={`今日用水 ${sensors.todayWaterM3} 噸`} />
        <Metric icon={<IconDrop width={18} height={18} />} label="蓄水桶" value={String(sensors.waterTankPct)} unit="%" sub={`約 ${sensors.waterTankL.toLocaleString()} 公升`}>
          <Bar pct={sensors.waterTankPct} color="var(--water)" warnBelow={30} />
        </Metric>
        <Metric icon={<IconFlask width={18} height={18} />} label="肥料桶" value={String(sensors.fertTankPct)} unit="%" sub={`約 ${sensors.fertTankL} 公升・今日用 ${sensors.todayFertL} 公升`}>
          <Bar pct={sensors.fertTankPct} color="var(--fert)" warnBelow={30} />
        </Metric>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 分區 */}
        <Card className="lg:col-span-2">
          <CardTitle action={<span className="text-xs text-muted">濕度 ≥ {moistureSkip}% 自動略過</span>}>四個分區</CardTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {zones.map((z) => (
              <div key={z.id} className={`rounded-xl border p-3.5 ${z.status === "running" ? "border-water bg-water-soft/50" : "border-line"}`}>
                <div className="flex items-center gap-2.5">
                  <ZoneBadge id={z.id} />
                  <div className="font-bold">
                    {z.id} 區・{z.name}
                  </div>
                  <span className="ml-auto">
                    <Pill tone={statusTone[z.status]}>{z.statusText}</Pill>
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted">土壤濕度</div>
                    <div className="text-2xl font-bold tabular">{z.moisture}%</div>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <div>今日用水 {z.todayWaterL} L</div>
                    <div>上次 {z.lastRun}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <Bar pct={z.moisture} color="var(--s1)" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          {/* 設備狀態 */}
          <Card>
            <CardTitle action={<Link href="/control" className="text-xs font-medium text-brand">去控制</Link>}>設備狀態</CardTitle>
            <ul className="flex flex-col divide-y divide-line">
              {devices.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted">{d.note}</div>
                  </div>
                  <OnOff on={d.on} onText={d.id === "main" ? "開啟" : "運轉中"} offText={d.id === "main" ? "關閉" : "停止"} />
                </li>
              ))}
              {zones.map((z) => (
                <li key={z.id} className="flex items-center justify-between py-2.5">
                  <div className="text-sm font-medium">{z.id} 區閥門</div>
                  <OnOff on={z.valveOpen} onText="開啟" offText="關閉" />
                </li>
              ))}
            </ul>
          </Card>

          {/* 下一次排程 */}
          <Card>
            <CardTitle>下一次排程</CardTitle>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <IconClock />
              </span>
              <div>
                <div className="font-bold">{nextRun.when}</div>
                <div className="text-sm text-muted">
                  {nextRun.name}・{nextRun.zones}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 告警 */}
      <Card>
        <CardTitle action={<Link href="/logs" className="text-xs font-medium text-brand">全部紀錄</Link>}>最近通知</CardTitle>
        <ul className="flex flex-col divide-y divide-line">
          {alerts.map((a) => (
            <li key={a.title} className="flex items-start gap-3 py-3">
              <div className="w-14 shrink-0 pt-0.5">
                <LevelTag level={a.level} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-muted">{a.detail}</div>
              </div>
              <div className="shrink-0 text-xs text-muted tabular">{a.time}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { btnClass, Button, Card, CardTitle, Switch, ZoneBadge } from "@/components/ui";
import { IconBack } from "@/components/icons";
import { schedules, weekday } from "@/lib/mock";

const field = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base outline-none focus:border-brand";

export default function EditSchedulePage() {
  const s = schedules[0];
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link href="/schedule" className="mb-2 inline-flex items-center gap-1 text-sm text-muted">
          <IconBack width={16} height={16} />
          排程
        </Link>
        <h1 className="text-2xl font-bold">編輯排程</h1>
      </div>

      <Card>
        <CardTitle>基本設定</CardTitle>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            排程名稱
            <input id="name" defaultValue={s.name} className={field} />
          </label>
          <div>
            <div className="mb-1 text-sm font-medium">類型</div>
            <div className="grid grid-cols-3 gap-2">
              {["液肥", "氮肥", "清水"].map((k) => (
                <button key={k} type="button" className={`rounded-xl border py-2.5 text-sm ${k === s.kind ? "border-fert bg-fert-soft font-bold text-fert" : "border-line text-muted"}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">星期</div>
            <div className="flex flex-wrap gap-2">
              {weekday.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  className={`h-10 w-10 rounded-full text-sm font-medium ${s.days.includes(i) ? "bg-brand text-white" : "border border-line text-muted"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            開始時間
            <input id="time" type="time" defaultValue={s.time} className={`${field} tabular`} />
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle action={<span className="text-xs text-muted">上下拖曳可調整順序</span>}>分區順序與時間</CardTitle>
        <ul className="flex flex-col gap-2">
          {s.zones.map((z) => (
            <li key={z.id} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
              <span className="cursor-grab px-1 text-muted" aria-hidden="true">⋮⋮</span>
              <ZoneBadge id={z.id} />
              <span className="flex-1 text-sm font-medium">{z.id} 區</span>
              <div className="flex items-center rounded-lg border border-line px-2">
                <input id={`zone-${z.id}`} defaultValue={z.min} inputMode="numeric" className="w-12 bg-transparent py-1.5 text-right outline-none tabular" />
                <span className="pl-1 text-sm text-muted">分</span>
              </div>
              <Switch on label={`${z.id} 區啟用`} />
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>注肥</CardTitle>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1">
            <button type="button" className="rounded-lg bg-surface py-2 text-sm font-bold shadow-sm">
              按比例
            </button>
            <button type="button" className="rounded-lg py-2 text-sm text-muted">
              按時間
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            每 100 公升水打
            <input id="ratio" defaultValue={2} inputMode="decimal" className="w-16 rounded-lg border border-line bg-surface px-2 py-1.5 text-center tabular" />
            公升肥
          </div>
          <p className="rounded-xl bg-fert-soft px-3 py-2 text-sm text-fert">試算：每區 20 分鐘約 270 公升水，會打 5.4 公升肥，4 區共 21.6 公升。</p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            注肥後清水沖管
            <div className="flex items-center rounded-xl border border-line bg-surface px-3">
              <input id="flush" defaultValue={s.flushMin} inputMode="numeric" className="w-full bg-transparent py-2.5 text-base outline-none tabular" />
              <span className="text-sm text-muted">分鐘</span>
            </div>
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>略過條件</CardTitle>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">土壤夠濕就略過該區</div>
            <div className="text-xs text-muted">濕度大於等於 {s.skipMoisture}% 時不灌</div>
          </div>
          <Switch on label="土壤夠濕就略過" />
        </div>
        <input id="skip" type="range" min={20} max={70} defaultValue={s.skipMoisture} className="mt-4 w-full accent-[var(--brand)]" aria-label="略過門檻" />
        <div className="flex justify-between text-xs text-muted tabular">
          <span>20%</span>
          <span>70%</span>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" className="text-crit hover:bg-crit-soft">
          刪除排程
        </Button>
        <div className="flex gap-3">
          <Link href="/schedule" className={btnClass("secondary", "flex-1 sm:flex-none")}>
            取消
          </Link>
          <Button className="flex-1 sm:flex-none">儲存並同步到控制箱</Button>
        </div>
      </div>
    </div>
  );
}

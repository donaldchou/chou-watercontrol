import { AccountCard } from "@/components/AccountCard";
import { Button, Card, CardTitle, PageHeader, Switch } from "@/components/ui";
import { IconLine, IconUpload } from "@/components/icons";
import { controller } from "@/lib/mock";

function NumField({ id, label, value, unit, hint }: { id: string; label: string; value: string; unit: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <div className="flex items-center rounded-xl border border-line bg-surface px-3">
        <input id={id} defaultValue={value} inputMode="decimal" className="w-full bg-transparent py-2.5 text-base outline-none tabular" />
        <span className="shrink-0 text-sm text-muted">{unit}</span>
      </div>
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

const notify = [
  { label: "蓄水桶沒水", on: true },
  { label: "水壓異常／疑似爆管", on: true },
  { label: "肥料桶低於 30%", on: true },
  { label: "控制箱斷線超過 15 分鐘", on: true },
  { label: "每次灌溉完成", on: false },
  { label: "每天晚上 8 點傳當日摘要", on: true },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="設定" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <IconLine width={18} height={18} className="text-brand" />
              LINE 通知
            </span>
          </CardTitle>
          <ul className="flex flex-col divide-y divide-line">
            {notify.map((n) => (
              <li key={n.label} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm">{n.label}</span>
                <Switch on={n.on} label={n.label} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">通知會傳到周家 LINE 官方帳號綁定的人。</p>
        </Card>

        <Card>
          <CardTitle>安全門檻</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField id="p-min" label="低水壓停機" value="1.0" unit="kg/cm²" hint="低於這個值判斷爆管" />
            <NumField id="p-max" label="高水壓停機" value="4.0" unit="kg/cm²" hint="高於這個值判斷堵塞" />
            <NumField id="max-min" label="單區最長灌溉" value="60" unit="分鐘" />
            <NumField id="no-flow" label="開閥後沒流量多久停機" value="60" unit="秒" />
          </div>
        </Card>

        <Card>
          <CardTitle>感測器校正</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumField id="pulse" label="流量計" value="450" unit="脈衝／公升" hint="用水桶接 10 公升實測" />
            <NumField id="inj" label="注肥泵流量" value="0.27" unit="公升／分" hint="開泵 1 分鐘量出肥量" />
            <NumField id="p-zero" label="水壓零點" value="0.50" unit="V" hint="沒水壓時的感測器電壓" />
            <NumField id="tank-h" label="蓄水桶容量" value="2000" unit="公升" />
          </div>
        </Card>

        <Card>
          <CardTitle>控制箱</CardTitle>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted">狀態</dt>
            <dd className="font-medium text-brand">連線中</dd>
            <dt className="text-muted">最後回報</dt>
            <dd className="tabular">今天 {controller.lastReport}</dd>
            <dt className="text-muted">4G 訊號</dt>
            <dd className="tabular">{controller.signalDbm} dBm（良好）</dd>
            <dt className="text-muted">已連續運轉</dt>
            <dd>{controller.uptime}</dd>
            <dt className="text-muted">程式版本</dt>
            <dd className="tabular">{controller.firmware}</dd>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary">
              <IconUpload width={18} height={18} />
              遠端更新程式
            </Button>
            <Button variant="secondary">重新啟動控制箱</Button>
          </div>
        </Card>

        <AccountCard />
      </div>
    </div>
  );
}

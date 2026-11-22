import { Button, Card, CardTitle, OnOff, PageHeader, Pill, Switch, ZoneBadge } from "@/components/ui";
import { IconAlert, IconInfo, IconPlay, IconStop } from "@/components/icons";
import { currentRun, devices, zones } from "@/lib/mock";

export default function ControlPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="手動控制" desc="直接從手機開關設備。所有操作都會記錄，也會受安全保護規則限制。" />

      {/* 緊急停止 */}
      <section className="flex flex-col gap-4 rounded-2xl border-2 border-crit bg-crit-soft p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold text-crit">
            <IconAlert />
            緊急停止
          </div>
          <p className="mt-1 text-sm text-muted">立刻關掉馬達、注肥泵和所有閥門，排程暫停到你按「恢復排程」為止。</p>
        </div>
        <Button variant="danger" className="py-4 text-base sm:px-8">
          <IconStop />
          全部停止
        </Button>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 手動灌溉 */}
        <Card>
          <CardTitle>手動灌溉一區</CardTitle>
          <p className="mb-4 text-sm text-muted">系統會自動照「開閥 → 確認水壓 → 注肥 → 清水沖管 → 關閥」的順序跑完。</p>

          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-medium">選擇分區</legend>
            <div className="grid grid-cols-4 gap-2">
              {zones.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs ${z.id === "C" ? "border-brand bg-brand-soft font-bold text-brand" : "border-line text-muted"}`}
                >
                  <ZoneBadge id={z.id} />
                  {z.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              灌溉時間
              <div className="flex items-center rounded-xl border border-line bg-surface px-3">
                <input id="manual-min" defaultValue={15} inputMode="numeric" className="w-full bg-transparent py-2.5 text-base outline-none tabular" />
                <span className="text-sm text-muted">分鐘</span>
              </div>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              注肥量
              <div className="flex items-center rounded-xl border border-line bg-surface px-3">
                <input id="manual-fert" defaultValue={3} inputMode="decimal" className="w-full bg-transparent py-2.5 text-base outline-none tabular" />
                <span className="text-sm text-muted">公升</span>
              </div>
            </label>
          </div>

          <div className="mb-5 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5">
            <div>
              <div className="text-sm font-medium">這次要注肥</div>
              <div className="text-xs text-muted">肥料桶目前裝：採收季液肥</div>
            </div>
            <Switch on label="這次要注肥" />
          </div>

          <div className="flex items-center gap-3">
            <Button className="flex-1">
              <IconPlay width={18} height={18} />
              開始灌溉 C 區
            </Button>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
            <IconInfo width={16} height={16} className="mt-px shrink-0" />
            現在 {currentRun.zone} 區正在灌溉，按下後會排在 {currentRun.queue.join("、")} 區之後。
          </p>
        </Card>

        {/* 個別設備 */}
        <Card>
          <CardTitle action={<Pill tone="fert">進階</Pill>}>個別設備開關</CardTitle>
          <p className="mb-3 text-sm text-muted">測試或檢修時使用。灰色的開關代表目前被安全規則擋住。</p>
          <ul className="flex flex-col divide-y divide-line">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{d.name}</div>
                  <OnOff on={d.on} onText={d.id === "main" ? "開啟" : "運轉中"} offText={d.id === "main" ? "關閉" : "停止"} />
                </div>
                <Switch on={d.on} label={d.name} />
              </li>
            ))}
            {zones.map((z) => (
              <li key={z.id} className="flex items-center gap-3 py-3">
                <ZoneBadge id={z.id} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{z.id} 區閥門</div>
                  {z.valveOpen ? (
                    <OnOff on onText="開啟" />
                  ) : (
                    <div className="text-xs text-muted">同時只能開一區，要先關 B 區</div>
                  )}
                </div>
                <Switch on={z.valveOpen} label={`${z.id} 區閥門`} disabled={!z.valveOpen} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle>安全保護規則</CardTitle>
        <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
          <li>・閥門沒開，馬達不能啟動</li>
          <li>・馬達沒在送水，注肥泵不能啟動</li>
          <li>・同一時間只開一區</li>
          <li>・蓄水桶沒水，馬達自動停</li>
          <li>・水壓低於 1.0 kg/cm²，判斷爆管並停機</li>
          <li>・單區灌溉超過 60 分鐘，強制停止</li>
        </ul>
      </Card>
    </div>
  );
}

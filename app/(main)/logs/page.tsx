import { Card, CardTitle, LevelTag, PageHeader, Pill, ZoneBadge } from "@/components/ui";
import { alerts, logs } from "@/lib/mock";

const resultTag = {
  done: { text: "完成", tone: "brand" },
  running: { text: "進行中", tone: "water" },
  skipped: { text: "略過", tone: "neutral" },
  stopped: { text: "中止", tone: "crit" },
} as const;

const tabs = ["灌溉紀錄", "通知"];

export default function LogsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="紀錄" desc="每次灌溉、略過、異常停機都會留下紀錄。" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
          {tabs.map((t, i) => (
            <button key={t} type="button" className={`rounded-lg px-4 py-1.5 text-sm ${i === 0 ? "bg-surface font-bold shadow-sm" : "text-muted"}`}>
              {t}
            </button>
          ))}
        </div>
        <select id="zone-filter" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm" defaultValue="all" aria-label="分區">
          <option value="all">全部分區</option>
          <option>A 區</option>
          <option>B 區</option>
          <option>C 區</option>
          <option>D 區</option>
        </select>
        <select id="month-filter" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm" defaultValue="11" aria-label="月份">
          <option value="11">2026 年 11 月</option>
          <option value="10">2026 年 10 月</option>
        </select>
      </div>

      {/* 手機：卡片 */}
      <div className="flex flex-col gap-2 md:hidden">
        {logs.map((l, i) => {
          const r = resultTag[l.result];
          return (
            <Card key={i} className="!p-3.5">
              <div className="flex items-center gap-2.5">
                <ZoneBadge id={l.zone} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{l.schedule}</div>
                  <div className="text-xs text-muted tabular">
                    {l.date} {l.time}
                  </div>
                </div>
                <Pill tone={r.tone}>{r.text}</Pill>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-surface-2 py-1.5">
                  <div className="text-muted">時間</div>
                  <div className="font-bold tabular">{l.minutes} 分</div>
                </div>
                <div className="rounded-lg bg-surface-2 py-1.5">
                  <div className="text-muted">用水</div>
                  <div className="font-bold tabular">{l.waterL} L</div>
                </div>
                <div className="rounded-lg bg-surface-2 py-1.5">
                  <div className="text-muted">用肥</div>
                  <div className="font-bold tabular">{l.fertL} L</div>
                </div>
              </div>
              {l.note && <div className="mt-2 text-xs text-muted">{l.note}</div>}
            </Card>
          );
        })}
      </div>

      {/* 桌機：表格 */}
      <Card className="hidden overflow-x-auto !p-0 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">日期時間</th>
              <th className="px-4 py-3 font-medium">分區</th>
              <th className="px-4 py-3 font-medium">排程</th>
              <th className="px-4 py-3 text-right font-medium">時間</th>
              <th className="px-4 py-3 text-right font-medium">用水</th>
              <th className="px-4 py-3 text-right font-medium">用肥</th>
              <th className="px-4 py-3 font-medium">結果</th>
              <th className="px-4 py-3 font-medium">備註</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((l, i) => {
              const r = resultTag[l.result];
              return (
                <tr key={i}>
                  <td className="px-4 py-3 tabular">
                    {l.date} {l.time}
                  </td>
                  <td className="px-4 py-3">
                    <ZoneBadge id={l.zone} />
                  </td>
                  <td className="px-4 py-3">{l.schedule}</td>
                  <td className="px-4 py-3 text-right tabular">{l.minutes} 分</td>
                  <td className="px-4 py-3 text-right tabular">{l.waterL} L</td>
                  <td className="px-4 py-3 text-right tabular">{l.fertL} L</td>
                  <td className="px-4 py-3">
                    <Pill tone={r.tone}>{r.text}</Pill>
                  </td>
                  <td className="px-4 py-3 text-muted">{l.note ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardTitle>通知（預覽）</CardTitle>
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

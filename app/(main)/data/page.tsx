import { BarChart, LineChart } from "@/components/charts";
import { Card, CardTitle, PageHeader } from "@/components/ui";
import { history, moistureSkip, pressureToday, zoneColor, type ZoneId } from "@/lib/mock";

const ranges = ["今天", "7 天", "14 天", "30 天", "今年"];
const zoneNames: Record<ZoneId, string> = { A: "A 區・最上坡", B: "B 區・中上坡", C: "C 區・中下坡", D: "D 區・最下坡" };

function Summary({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs text-muted">{unit}</span>
      </div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}

export default function DataPage() {
  const water = history.waterM3.reduce((a, b) => a + b, 0);
  const fert = history.fertL.reduce((a, b) => a + b, 0);
  const runs = history.waterM3.filter((v) => v > 0).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="數據圖表" desc="手指按住圖表或滑鼠移過去，可以看每一天的數字。" />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${r === "14 天" ? "bg-brand font-bold text-white" : "border border-line bg-surface text-muted"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary label="總用水" value={water.toFixed(1)} unit="噸" sub="11/08～11/21" />
        <Summary label="總用肥" value={fert.toFixed(1)} unit="公升" sub="採收季液肥" />
        <Summary label="灌溉天數" value={String(runs)} unit="天" sub="其中 2 天下雨略過" />
        <Summary label="平均每棵" value={((water * 1000) / 200 / 14).toFixed(1)} unit="公升／天" sub="200 棵平均" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>每日用水量</CardTitle>
          <BarChart labels={history.labels} values={history.waterM3} unit="噸" color="var(--water)" name="用水量" />
        </Card>
        <Card>
          <CardTitle>每日用肥量</CardTitle>
          <BarChart labels={history.labels} values={history.fertL} unit="公升" color="var(--fert)" name="用肥量" />
        </Card>
      </div>

      <Card>
        <CardTitle action={<span className="text-xs text-muted">11/13、11/14 下雨</span>}>各區土壤濕度</CardTitle>
        <LineChart
          labels={history.labels}
          unit="%"
          max={70}
          threshold={{ value: moistureSkip, label: `${moistureSkip}% 以上略過灌溉` }}
          series={(["A", "B", "C", "D"] as ZoneId[]).map((z) => ({ name: zoneNames[z], short: z, color: zoneColor[z], values: history.moisture[z] }))}
        />
      </Card>

      <Card>
        <CardTitle action={<span className="text-xs text-muted">今天・每 2 小時</span>}>主管水壓</CardTitle>
        <LineChart
          labels={pressureToday.labels.map((h) => `${h}:00`)}
          unit="kg/cm²"
          max={2.5}
          threshold={{ value: 1, label: "1.0 以下停機" }}
          series={[{ name: "水壓", short: "", color: "var(--water)", values: pressureToday.values }]}
        />
      </Card>
    </div>
  );
}

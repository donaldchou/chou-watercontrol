// 樣稿用的模擬資料。之後接上 ESP32 與 MongoDB 時會換成真實資料。

export type ZoneId = "A" | "B" | "C" | "D";
export type Level = "good" | "warn" | "serious" | "crit";

export const zoneColor: Record<ZoneId, string> = {
  A: "var(--s1)",
  B: "var(--s2)",
  C: "var(--s3)",
  D: "var(--s4)",
};

export const controller = {
  online: true,
  signalBars: 4,
  signalDbm: -73,
  lastReport: "14:32:05",
  firmware: "v0.1.0",
  uptime: "6 天 3 小時",
  mode: "採收季液肥",
};

export const currentRun = {
  active: true,
  scheduleName: "採收季早晨施肥",
  zone: "B" as ZoneId,
  step: "注肥中",
  steps: ["開閥", "確認水壓", "注肥", "清水沖管", "關閥"],
  stepIndex: 2,
  elapsedMin: 12,
  totalMin: 20,
  fertGivenL: 3.2,
  fertTargetL: 5,
  waterL: 162,
  queue: ["C", "D"] as ZoneId[],
};

export const sensors = {
  pressure: 1.8, // kg/cm²
  pressureMin: 1.0,
  flow: 13.5, // L/min
  waterTankPct: 78,
  waterTankL: 1560,
  fertTankPct: 42,
  fertTankL: 210,
  todayWaterM3: 2.4,
  todayFertL: 8.2,
};

export const devices = [
  { id: "motor", name: "加壓馬達", on: true, note: "1/2 HP" },
  { id: "injector", name: "注肥泵", on: true, note: "0.27 L/分" },
  { id: "main", name: "總閥", on: true, note: "電動球閥" },
];

export const zones: {
  id: ZoneId;
  name: string;
  moisture: number;
  status: "running" | "done" | "waiting" | "skipped";
  statusText: string;
  lastRun: string;
  todayWaterL: number;
  valveOpen: boolean;
}[] = [
  { id: "A", name: "最上坡", moisture: 32, status: "done", statusText: "已完成", lastRun: "今天 06:20", todayWaterL: 820, valveOpen: false },
  { id: "B", name: "中上坡", moisture: 28, status: "running", statusText: "灌溉中", lastRun: "進行中", todayWaterL: 162, valveOpen: true },
  { id: "C", name: "中下坡", moisture: 41, status: "waiting", statusText: "排隊中", lastRun: "昨天 06:45", todayWaterL: 0, valveOpen: false },
  { id: "D", name: "最下坡", moisture: 47, status: "skipped", statusText: "今日略過", lastRun: "前天 07:10", todayWaterL: 0, valveOpen: false },
];

export const moistureSkip = 45;

export const nextRun = { when: "11/23（一）06:00", name: "採收季早晨施肥", zones: "A → B → C → D" };

export const alerts: { level: Level; title: string; detail: string; time: string }[] = [
  { level: "warn", title: "肥料桶剩 42%", detail: "大約還能用 3 次，記得補肥", time: "今天 14:10" },
  { level: "good", title: "D 區今日略過", detail: "土壤濕度 47%，高於 45% 門檻", time: "今天 06:00" },
  { level: "serious", title: "控制箱斷線 18 分鐘", detail: "已自動重連，期間數據已補傳", time: "11/20 22:41" },
  { level: "crit", title: "A 區水壓過低，已停機", detail: "水壓 0.4 kg/cm²，可能管路破裂", time: "11/18 06:12" },
];

export const schedules = [
  {
    id: "s1",
    name: "採收季早晨施肥",
    kind: "液肥" as const,
    enabled: true,
    days: [1, 3, 5],
    time: "06:00",
    zones: [
      { id: "A" as ZoneId, min: 20 },
      { id: "B" as ZoneId, min: 20 },
      { id: "C" as ZoneId, min: 20 },
      { id: "D" as ZoneId, min: 20 },
    ],
    fert: "每 100 公升水打 2 公升肥",
    flushMin: 5,
    skipMoisture: 45,
  },
  {
    id: "s2",
    name: "傍晚補水",
    kind: "清水" as const,
    enabled: true,
    days: [0, 1, 2, 3, 4, 5, 6],
    time: "17:30",
    zones: [
      { id: "A" as ZoneId, min: 10 },
      { id: "B" as ZoneId, min: 10 },
      { id: "C" as ZoneId, min: 8 },
      { id: "D" as ZoneId, min: 8 },
    ],
    fert: "不注肥",
    flushMin: 0,
    skipMoisture: 40,
  },
  {
    id: "s3",
    name: "平時氮肥",
    kind: "氮肥" as const,
    enabled: false,
    days: [2, 6],
    time: "06:30",
    zones: [
      { id: "A" as ZoneId, min: 15 },
      { id: "B" as ZoneId, min: 15 },
      { id: "C" as ZoneId, min: 15 },
      { id: "D" as ZoneId, min: 15 },
    ],
    fert: "每區注肥 4 分鐘",
    flushMin: 5,
    skipMoisture: 45,
  },
];

export const weekday = ["日", "一", "二", "三", "四", "五", "六"];

const days14 = ["11/08", "11/09", "11/10", "11/11", "11/12", "11/13", "11/14", "11/15", "11/16", "11/17", "11/18", "11/19", "11/20", "11/21"];

export const history = {
  labels: days14,
  waterM3: [3.1, 0.9, 3.3, 1.0, 3.2, 0, 0, 3.4, 1.1, 3.3, 0.6, 3.5, 1.0, 2.4],
  fertL: [9.8, 0, 10.2, 0, 9.9, 0, 0, 10.4, 0, 10.1, 1.5, 10.6, 0, 8.2],
  moisture: {
    A: [30, 36, 33, 37, 34, 52, 49, 35, 38, 34, 30, 33, 36, 32],
    B: [27, 33, 30, 34, 31, 50, 47, 32, 35, 31, 29, 30, 33, 28],
    C: [38, 43, 40, 44, 41, 58, 55, 42, 45, 41, 39, 40, 43, 41],
    D: [44, 48, 45, 49, 46, 62, 60, 47, 50, 46, 44, 45, 48, 47],
  } as Record<ZoneId, number[]>,
  rainDays: ["11/13", "11/14"],
};

export const pressureToday = {
  labels: ["00", "02", "04", "06", "08", "10", "12", "14"],
  values: [0, 0, 0, 1.9, 0, 0, 0, 1.8],
};

export const logs: {
  date: string;
  time: string;
  schedule: string;
  zone: ZoneId;
  minutes: number;
  waterL: number;
  fertL: number;
  result: "done" | "skipped" | "stopped" | "running";
  note?: string;
}[] = [
  { date: "11/21", time: "06:25", schedule: "採收季早晨施肥", zone: "B", minutes: 12, waterL: 162, fertL: 3.2, result: "running" },
  { date: "11/21", time: "06:00", schedule: "採收季早晨施肥", zone: "A", minutes: 20, waterL: 820, fertL: 5.0, result: "done" },
  { date: "11/21", time: "06:00", schedule: "採收季早晨施肥", zone: "D", minutes: 0, waterL: 0, fertL: 0, result: "skipped", note: "濕度 47% 高於門檻" },
  { date: "11/20", time: "17:30", schedule: "傍晚補水", zone: "A", minutes: 10, waterL: 410, fertL: 0, result: "done" },
  { date: "11/20", time: "17:40", schedule: "傍晚補水", zone: "B", minutes: 10, waterL: 405, fertL: 0, result: "done" },
  { date: "11/19", time: "06:00", schedule: "採收季早晨施肥", zone: "C", minutes: 20, waterL: 815, fertL: 5.0, result: "done" },
  { date: "11/18", time: "06:00", schedule: "採收季早晨施肥", zone: "A", minutes: 3, waterL: 96, fertL: 0, result: "stopped", note: "水壓過低 0.4 kg/cm²" },
  { date: "11/18", time: "10:15", schedule: "手動", zone: "A", minutes: 15, waterL: 610, fertL: 1.5, result: "done", note: "修好管路後手動補灌" },
];

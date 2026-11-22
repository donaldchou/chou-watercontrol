"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight, LayoutGrid, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { controller } from "@/lib/mock";
import { logout, useMe } from "@/lib/client";
import { OrchardPicker } from "./OrchardPicker";
import { PlatformLinks } from "./PlatformLinks";
import { IconBlueprint, IconCalendar, IconChart, IconHome, IconList, IconSettings, IconSignal, IconSliders } from "./icons";

/** 左側選單（同 chou-platform 的機制：分組、可收合、手機抽屜） */
const NAV = [
  {
    group: "監控",
    items: [
      { href: "/sites", label: "所有案場", Icon: LayoutGrid },
      { href: "/", label: "總覽", Icon: IconHome },
      { href: "/data", label: "數據", Icon: IconChart },
      { href: "/logs", label: "紀錄", Icon: IconList },
    ],
  },
  {
    group: "操作",
    items: [
      { href: "/control", label: "控制", Icon: IconSliders },
      { href: "/schedule", label: "排程", Icon: IconCalendar },
    ],
  },
  {
    group: "系統",
    items: [
      { href: "/design", label: "設計圖", Icon: IconBlueprint },
      { href: "/settings", label: "設定", Icon: IconSettings },
    ],
  },
];

/** 只有管理者看得到的選單 */
const ADMIN_NAV = { group: "管理", items: [{ href: "/admin", label: "後台管理", Icon: ShieldCheck }] };

/** 一般使用者在這些頁面只能看：按鈕、輸入框全部停用 */
const EDIT_PAGES = ["/control", "/schedule", "/settings"];

/* ---------------- 記在這台電腦瀏覽器的設定（側邊選單收合、分組收合） ---------------- */
function localSetting(key: string, fallback: string) {
  const listeners = new Set<() => void>();
  let memory: string | null = null;
  const read = () => {
    if (memory !== null) return memory;
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (v: string) => {
    memory = v;
    try {
      localStorage.setItem(key, v);
    } catch {
      /* 無痕模式等無法儲存時，只在這次瀏覽有效 */
    }
    listeners.forEach((l) => l());
  };
  const use = () =>
    useSyncExternalStore(
      (l) => {
        listeners.add(l);
        return () => listeners.delete(l);
      },
      read,
      () => fallback,
    );
  return { use, write };
}
const collapsedSetting = localSetting("chou-watercontrol-sidebar-collapsed", "0");
const groupsSetting = localSetting("chou-watercontrol-nav-closed-groups", "[]");

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

function Connection() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium whitespace-nowrap text-brand">
      <IconSignal bars={controller.signalBars} />
      {controller.online ? "控制箱連線中" : "控制箱離線"}
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const collapsed = collapsedSetting.use() === "1";
  const setCollapsed = (v: boolean) => collapsedSetting.write(v ? "1" : "0");
  let closedGroups: Set<string>;
  try {
    closedGroups = new Set(JSON.parse(groupsSetting.use()) as string[]);
  } catch {
    closedGroups = new Set();
  }
  const toggleGroup = (g: string) => {
    const next = new Set(closedGroups);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    groupsSetting.write(JSON.stringify([...next]));
  };

  const me = useMe();
  const groups = me?.role === "admin" ? [...NAV, ADMIN_NAV] : NAV;
  const roleLabel = me ? (me.role === "admin" ? "管理者" : "一般使用者") : "";
  const allClosed = groups.every((g) => closedGroups.has(g.group));
  const toggleAll = () => groupsSetting.write(JSON.stringify(allClosed ? [] : groups.map((g) => g.group)));
  const readOnly = me?.role === "user" && EDIT_PAGES.some((p) => isActive(path, p));

  const nav = (mini: boolean) => (
    <nav className="flex h-full flex-col">
      <div className={`flex items-center gap-2.5 py-5 ${mini ? "justify-center px-2" : "px-5"}`}>
        {/* 點圖示：全部分組展開／收合（只剩圖示的窄選單沒有分組，改成展開選單） */}
        <button
          type="button"
          onClick={() => (mini ? setCollapsed(false) : toggleAll())}
          title={mini ? "展開選單" : allClosed ? "全部展開" : "全部收合"}
          aria-label={mini ? "展開選單" : allClosed ? "全部展開" : "全部收合"}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition hover:brightness-110"
        >
          {/* 平台自己的分頁圖示（favicon） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" width={40} height={40} alt="" className="block" />
        </button>
        {!mini && (
          <div className="min-w-0">
            <div className="truncate text-lg leading-tight font-bold text-white">CHOU 農場平台</div>
            <div className="text-sm text-emerald-200/80">水肥控制系統</div>
          </div>
        )}
      </div>
      <div
        className={`flex-1 space-y-4 overflow-x-hidden overflow-y-auto pb-4 ${mini ? "px-2" : "px-3"}`}
        style={{ scrollbarWidth: "thin", scrollbarColor: "#047857 transparent" }}
      >
        {groups.map((g) => {
          const groupOpen = mini || !closedGroups.has(g.group);
          const hasActive = g.items.some((it) => isActive(path, it.href));
          return (
            <div key={g.group}>
              {mini ? (
                <div className="mx-2 mb-2 border-t border-emerald-800" />
              ) : (
                <button
                  type="button"
                  onClick={() => toggleGroup(g.group)}
                  aria-expanded={groupOpen}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2 pt-0.5 pb-1 text-sm font-semibold tracking-wider hover:text-emerald-100 ${
                    !groupOpen && hasActive ? "text-emerald-100" : "text-emerald-300/70"
                  }`}
                >
                  <span>{g.group}</span>
                  <span className="flex items-center gap-1.5">
                    {!groupOpen && <span className="text-xs font-normal">{g.items.length}</span>}
                    <ChevronDown size={16} className={`transition-transform ${groupOpen ? "" : "-rotate-90"}`} />
                  </span>
                </button>
              )}
              {groupOpen &&
                g.items.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    title={mini ? label : undefined}
                    aria-label={mini ? label : undefined}
                    className={`flex items-center gap-3 rounded-lg py-2.5 text-base transition-colors ${mini ? "justify-center px-0" : "px-3"} ${
                      isActive(path, href) ? "bg-emerald-700 font-medium text-white" : "text-emerald-50/85 hover:bg-emerald-800/70"
                    }`}
                  >
                    <Icon width={20} height={20} className="shrink-0" />
                    {!mini && <span className="truncate">{label}</span>}
                  </Link>
                ))}
            </div>
          );
        })}
      </div>
      <div className="space-y-1 border-t border-emerald-800 p-3">
        <PlatformLinks current="chou-watercontrol" mini={mini} captionClass="text-emerald-300/70" />
        <div
          className={`flex items-center gap-2 text-base text-emerald-100 ${mini ? "justify-center" : "px-2"}`}
          title={me ? `${me.email}（${roleLabel}）` : undefined}
        >
          <UserRound size={18} className="shrink-0" />
          {!mini && (
            <div className="min-w-0">
              <div className="truncate">{me?.name || me?.email || "…"}</div>
              <div className="text-sm text-emerald-300/80">{roleLabel}</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          title={mini ? "登出" : undefined}
          aria-label="登出"
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-base text-emerald-50/85 hover:bg-emerald-800/70 ${mini ? "justify-center px-0" : "px-3"}`}
        >
          <LogOut size={18} className="shrink-0" /> {!mini && "登出"}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* 桌機：浮動、圓角的選單，可收合成只剩圖示 */}
      <aside
        className={`fixed inset-y-3 left-3 z-30 hidden rounded-2xl bg-emerald-950 shadow-xl transition-[width] duration-200 lg:block ${collapsed ? "w-18" : "w-64"}`}
      >
        {nav(collapsed)}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-7 -right-3.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-muted shadow-md hover:text-brand"
          aria-label={collapsed ? "展開選單" : "收合選單"}
          title={collapsed ? "展開選單" : "收合選單"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </aside>

      {/* 手機：抽屜 */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-emerald-950">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-6 right-3 text-emerald-100" aria-label="關閉選單">
              <X size={22} />
            </button>
            {nav(false)}
          </aside>
        </div>
      )}

      <div className={`flex min-h-screen flex-col transition-[padding] duration-200 ${collapsed ? "lg:pl-24" : "lg:pl-70"}`}>
        {/* 手機頂欄 */}
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3 px-3 pt-3 pb-2">
            <button type="button" onClick={() => setOpen(true)} aria-label="開啟選單" className="text-ink">
              <Menu size={24} />
            </button>
            <span className="truncate font-bold">CHOU 農場平台</span>
          </div>
          {/* 頂欄下方：果園切換＋控制箱連線狀態 */}
          <div className="flex items-center gap-2 px-3 pb-2.5">
            <OrchardPicker mobile />
            <span className="ml-auto">
              <Connection />
            </span>
          </div>
        </header>
        {/* 桌機右上：果園切換＋連線狀態 */}
        <div className="hidden items-center justify-end gap-3 px-6 pt-4 lg:flex">
          <OrchardPicker />
          <Connection />
        </div>

        <div className="bg-fert-soft px-4 py-1.5 text-center text-xs text-fert lg:mx-6 lg:mt-3 lg:rounded-lg">UI 樣稿：畫面上的數據都是模擬的，按鈕還不會動作</div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-10 sm:px-6">
          {readOnly && (
            <p className="mb-4 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-muted">
              你的身分是一般使用者，這一頁只能查看，不能操作或修改。
            </p>
          )}
          {readOnly ? (
            <fieldset disabled className="m-0 min-w-0 border-0 p-0">
              {children}
            </fieldset>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

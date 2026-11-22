"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { controller } from "@/lib/mock";
import { IconBlueprint, IconCalendar, IconChart, IconHome, IconLeaf, IconList, IconSettings, IconSignal, IconSliders } from "./icons";

const nav = [
  { href: "/", label: "總覽", Icon: IconHome },
  { href: "/control", label: "控制", Icon: IconSliders },
  { href: "/schedule", label: "排程", Icon: IconCalendar },
  { href: "/data", label: "數據", Icon: IconChart },
  { href: "/logs", label: "紀錄", Icon: IconList },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

function Connection() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
      <IconSignal bars={controller.signalBars} />
      {controller.online ? "控制箱連線中" : "控制箱離線"}
    </span>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();

  return (
    <div className="min-h-screen lg:flex">
      {/* 桌機側欄 */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <IconLeaf />
          </span>
          <div className="leading-tight">
            <div className="font-bold">周家果園</div>
            <div className="text-xs text-muted">水肥控制系統</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {[...nav, { href: "/design", label: "設計圖", Icon: IconBlueprint }, { href: "/settings", label: "設定", Icon: IconSettings }].map(({ href, label, Icon }) => {
            const on = isActive(path, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${on ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-xl bg-surface-2 p-3 text-xs text-muted">
          <Connection />
          <div className="mt-2">最後回報 {controller.lastReport}</div>
          <div>訊號 {controller.signalDbm} dBm・中華電信</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 手機頂欄 */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <IconLeaf width={18} height={18} />
            </span>
            <span className="font-bold">周家果園</span>
          </div>
          <div className="flex items-center gap-2">
            <Connection />
            <Link href="/settings" aria-label="設定" className={`rounded-lg p-1.5 ${isActive(path, "/settings") ? "text-brand" : "text-muted"}`}>
              <IconSettings />
            </Link>
          </div>
        </header>

        <div className="bg-fert-soft px-4 py-1.5 text-center text-xs text-fert">UI 樣稿：畫面上的數據都是模擬的，按鈕還不會動作</div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-10">{children}</main>

        {/* 手機底部分頁 */}
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {nav.map(({ href, label, Icon }) => {
            const on = isActive(path, href);
            return (
              <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${on ? "text-brand" : "text-muted"}`}>
                <Icon width={22} height={22} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

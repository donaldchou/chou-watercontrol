"use client";

import Link from "next/link";
import { logout, useMe } from "@/lib/client";
import { Card, CardTitle } from "./ui";

/** 設定頁的「帳號」區塊：目前登入的人、身分、登出；管理者多一個「管理帳號」 */
export function AccountCard() {
  const me = useMe();
  return (
    <Card className="lg:col-span-2">
      <CardTitle>帳號</CardTitle>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted">登入帳號</dt>
        <dd className="min-w-0 truncate">{me?.email ?? "…"}</dd>
        <dt className="text-muted">身分</dt>
        <dd>{me ? (me.role === "admin" ? "管理者（可以操作所有功能）" : "一般使用者（只能查看）") : "…"}</dd>
      </dl>
      {/* 登出不受「一般使用者只能看」的停用影響，所以用 fieldset 之外也能按的連結樣式按鈕 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {me?.role === "admin" && (
          <Link href="/admin" className="inline-flex items-center rounded-xl border border-line px-4 py-2.5 text-sm font-bold hover:bg-surface-2">
            管理帳號（後台）
          </Link>
        )}
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            void logout();
          }}
          className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-bold text-crit hover:bg-crit-soft"
        >
          登出
        </a>
      </div>
    </Card>
  );
}

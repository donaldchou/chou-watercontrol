"use client";

import { useState } from "react";

const field = "w-full rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-brand";

/** 登入後要回到的頁面（預設「所有案場」）；只接受站內路徑，避免被導到別的網站 */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next") ?? "/sites";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/sites";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `登入失敗（HTTP ${res.status}）`);
      }
      // 整頁重新載入，讓登入身分重新讀取
      window.location.href = nextPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPassword("");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {/* 平台自己的分頁圖示（proxy 已放行 /icon.svg，不用登入也讀得到） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" width={56} height={56} alt="" className="block" />
          <div>
            <h1 className="text-2xl font-bold">CHOU 農場平台</h1>
            <p className="text-sm text-muted">水肥控制系統</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input id="email" type="email" autoComplete="username" autoFocus required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            密碼
            <input id="password" type="password" autoComplete="current-password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="rounded-xl bg-crit-soft px-3 py-2 text-sm text-crit">{error}</p>}
          <button type="submit" disabled={busy} className="rounded-xl bg-brand py-3 font-bold text-white hover:opacity-90 disabled:opacity-60">
            {busy ? "登入中…" : "登入"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">登入後 7 天內不用再登入。沒有帳號請找管理者建立。</p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { IconLeaf } from "@/components/icons";

const field = "w-full rounded-xl border border-line bg-surface px-3 py-3 text-base outline-none focus:border-brand";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
            <IconLeaf width={28} height={28} />
          </span>
          <div>
            <h1 className="text-2xl font-bold">周家果園</h1>
            <p className="text-sm text-muted">水肥控制系統</p>
          </div>
        </div>

        <form className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
          <label className="flex flex-col gap-1 text-sm font-medium">
            帳號
            <input id="account" autoComplete="username" className={field} placeholder="輸入帳號" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            密碼
            <input id="password" type="password" autoComplete="current-password" className={field} placeholder="輸入密碼" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input id="remember" type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--brand)]" />
            這台手機保持登入 30 天
          </label>
          <Link href="/" className="rounded-xl bg-brand py-3 text-center font-bold text-white hover:opacity-90">
            登入
          </Link>
        </form>
        <p className="mt-4 text-center text-xs text-muted">UI 樣稿：按登入直接進入總覽</p>
      </div>
    </main>
  );
}

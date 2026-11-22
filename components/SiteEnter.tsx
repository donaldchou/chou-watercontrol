"use client";

import { useRouter } from "next/navigation";
import { setOrchard } from "./OrchardPicker";
import { btnClass } from "./ui";

/** 「進入這個案場」：切換目前果園後回到總覽 */
export function SiteEnter({ id, example }: { id: string; example: boolean }) {
  const router = useRouter();
  if (example) return <span className="text-xs text-muted">示意資料，不能進入</span>;
  return (
    <button
      type="button"
      onClick={() => {
        setOrchard(id);
        router.push("/");
      }}
      className={btnClass("secondary", "px-3 py-2")}
    >
      進入案場
    </button>
  );
}

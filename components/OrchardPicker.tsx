"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { orchards } from "@/lib/mock";

/* ---------------- 目前果園：記在這台電腦的瀏覽器 ---------------- */
const KEY = "chou-watercontrol-orchard";
const listeners = new Set<() => void>();
let memory: string | null = null;
function read() {
  if (memory) return memory;
  try {
    const v = localStorage.getItem(KEY);
    if (v && orchards.some((o) => o.id === v)) return v;
  } catch {
    /* 無法讀取時用第一個果園 */
  }
  return orchards[0].id;
}
function write(id: string) {
  memory = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* 無法儲存時只在這次瀏覽有效 */
  }
  listeners.forEach((l) => l());
}
export function useOrchard() {
  const id = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => orchards[0].id,
  );
  return orchards.find((o) => o.id === id) ?? orchards[0];
}

/** 目前果園名稱（給伺服器元件的頁面用） */
export function OrchardName() {
  return <>{useOrchard().name}</>;
}

function Options({ current, onPick }: { current: string; onPick: (id: string) => void }) {
  return (
    <div role="listbox" aria-label="選擇果園">
      <div className="px-3 pt-1 pb-1.5 text-xs text-muted">有裝控制箱的果園</div>
      {orchards.map((o) => (
        <button
          key={o.id}
          type="button"
          role="option"
          aria-selected={o.id === current}
          onClick={() => onPick(o.id)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm ${o.id === current ? "bg-brand-soft font-bold" : "hover:bg-surface-2"}`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${o.online ? "bg-good" : "bg-crit"}`} />
          {o.name}
          <span className={`ml-auto text-xs ${o.online ? "text-good" : "text-crit"}`}>{o.online ? "連線中" : "離線"}</span>
          {o.id === current && <Check size={16} className="text-brand" />}
        </button>
      ))}
      <p className="px-3 pt-2 pb-1 text-xs text-muted">其他果園裝了控制箱之後，會出現在這裡。</p>
    </div>
  );
}

/**
 * 果園切換（B 版：頁面最上方）。電腦版在右上角下拉；手機版在頂欄下方，點了從下方跳出清單。
 * 一般使用者也可以切換（只影響看哪個果園，不會改到資料）。
 */
export function OrchardPicker({ mobile = false }: { mobile?: boolean }) {
  const current = useOrchard();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !mobile && !box.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, mobile]);

  const pick = (id: string) => {
    write(id);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm hover:bg-surface-2"
      >
        <MapPin size={15} className="text-brand" />
        <span className="text-xs text-muted">果園</span>
        <b className="max-w-40 truncate">{current.name}</b>
        <ChevronDown size={15} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !mobile && (
        <div className="absolute top-full right-0 z-30 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
          <Options current={current.id} onPick={pick} />
        </div>
      )}

      {/* 手機：從下方跳出。頂欄有毛玻璃效果（backdrop-filter）會困住 fixed 元素，所以放到 body 底下 */}
      {open &&
        mobile &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-surface p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto mt-1 mb-2 h-1 w-10 rounded-full bg-line" />
              <Options current={current.id} onPick={pick} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

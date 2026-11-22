// 設計圖：原始 HTML 放在 public/design/，網站用 iframe 顯示
export const designs = [
  {
    slug: "architecture",
    file: "/design/architecture.html",
    title: "周家果園自動水肥系統",
    desc: "系統架構圖、施肥灌溉流程、採購清單與預算（含設備照片）、待確認項目。",
  },
  {
    slug: "drip-3d",
    file: "/design/drip-3d.html",
    title: "吊線滴灌 3D 示意",
    desc: "陡坡果園的首部設備位置、滴灌管架高吊線、背負式割草，可旋轉縮放。需要網路才能顯示。",
  },
  {
    slug: "control-box",
    file: "/design/control-box.html",
    title: "果園控制電箱設計",
    desc: "盤面配置、門板、接線圖、電動球閥接線、繼電器與腳位對照、電箱材料清單。",
  },
] as const;

export type Design = (typeof designs)[number];

export function findDesign(slug: string): Design | undefined {
  return designs.find((d) => d.slug === slug);
}

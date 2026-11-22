import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_TC({
  variable: "--font-noto",
  weight: ["400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "周家果園水肥控制",
  description: "拉拉山水蜜桃園自動灌溉與施肥監控",
};

export const viewport: Viewport = {
  themeColor: "#2c7a4b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}

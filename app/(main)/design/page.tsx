import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { IconBlueprint, IconChevron } from "@/components/icons";
import { designs } from "@/lib/designs";

export default function DesignListPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="設計圖" desc="系統架構、3D 示意和電箱設計。施工和採購時可以直接在這裡查看。" />
      <div className="grid gap-4 md:grid-cols-3">
        {designs.map((d) => (
          <Link key={d.slug} href={`/design/${d.slug}`} className="group">
            <Card className="flex h-full flex-col gap-3 transition group-hover:border-brand">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <IconBlueprint />
              </span>
              <div className="flex-1">
                <h2 className="text-base font-bold">{d.title}</h2>
                <p className="mt-1 text-sm text-muted">{d.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                查看
                <IconChevron width={16} height={16} />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

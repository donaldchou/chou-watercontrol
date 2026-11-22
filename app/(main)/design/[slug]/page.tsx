import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBack, IconExternal } from "@/components/icons";
import { designs, findDesign } from "@/lib/designs";

export function generateStaticParams() {
  return designs.map((d) => ({ slug: d.slug }));
}

export default async function DesignPage({ params }: PageProps<"/design/[slug]">) {
  const { slug } = await params;
  const d = findDesign(slug);
  if (!d) notFound();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/design" className="mb-1 inline-flex items-center gap-1 text-sm text-muted">
            <IconBack width={16} height={16} />
            設計圖
          </Link>
          <h1 className="text-2xl font-bold">{d.title}</h1>
        </div>
        <a href={d.file} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
          新分頁開啟
          <IconExternal width={16} height={16} />
        </a>
      </div>
      <iframe
        src={d.file}
        title={d.title}
        className="h-[calc(100dvh-15rem)] min-h-[560px] w-full rounded-2xl border border-line bg-white lg:h-[calc(100dvh-9rem)]"
      />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { jokiQO } from "@/lib/site-queries";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/joki/")({
  head: () => ({
    meta: [
      { title: "Jasa Joki Blox Fruits — The Black Prince" },
      { name: "description", content: "Jasa joki Blox Fruits: level, race V4, awaken fruit, raid, CDK, bounty & lainnya." },
      { property: "og:title", content: "Jasa Joki Blox Fruits" },
      { property: "og:description", content: "Joki cepat, aman, dan bergaransi." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jokiQO),
  component: JokiPage,
});

function JokiPage() {
  const joki = (useQuery(jokiQO).data ?? []).filter((j: any) => j.active);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return joki;
    return joki.filter((j: any) =>
      [j.name, j.category, j.estimation, j.description]
        .filter((v: any) => v != null && v !== "")
        .some((v: any) => String(v).toLowerCase().includes(s)),
    );
  }, [joki, q]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black">
          Jasa <span className="text-gradient">Joki</span>
        </h1>
        <p className="text-sm text-muted-foreground">Level, race, awaken, raid — tinggal titip akun.</p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari joki... (nama, kategori)"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((j: any) => {
            const stock = j.stock == null ? null : Number(j.stock);
            const ready = Boolean(j.active) && (stock == null || stock > 0);
            return (
              <ProductCard
                key={j.id}
                id={j.id}
                kind="joki"
                name={j.name}
                price={Number(j.price)}
                priceRm={j.price_rm != null ? Number(j.price_rm) : null}
                image_url={j.image_url}
                alt_text={j.alt_text}
                stock={stock}
                ready={ready}
                category={j.category || j.estimation}
                meta={j.description}
              />
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              {joki.length === 0 ? "Belum ada layanan joki aktif." : "Nggak ada joki yang cocok."}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { jokiQO } from "@/lib/site-queries";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/joki")({
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
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black">
          Jasa <span className="text-gradient">Joki</span>
        </h1>
        <p className="text-sm text-muted-foreground">Level, race, awaken, raid — tinggal titip akun.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {joki.map((j: any) => {
            const stock = j.stock == null ? null : Number(j.stock);
            const ready = Boolean(j.active) && (stock == null || stock > 0);
            return (
              <ProductCard
                key={j.id}
                id={j.id}
                kind="joki"
                name={j.name}
                price={Number(j.price)}
                image_url={j.image_url}
                alt_text={j.alt_text}
                stock={stock}
                ready={ready}
                category={j.category || j.estimation}
                meta={j.description}
              />
            );
          })}
          {joki.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Belum ada layanan joki aktif.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

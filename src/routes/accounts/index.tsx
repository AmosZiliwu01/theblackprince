import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { accountsQO } from "@/lib/site-queries";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/accounts/")({
  head: () => ({
    meta: [
      { title: "Harga Akun Blox Fruits — The Black Prince" },
      { name: "description", content: "Jual beli akun Blox Fruits: dari starter sampai end game dengan fruit rare." },
      { property: "og:title", content: "Harga Akun Blox Fruits" },
      { property: "og:description", content: "Akun Blox Fruits siap pakai dengan berbagai spek." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountsQO),
  component: AccountsPage,
});

function AccountsPage() {
  const accounts = useQuery(accountsQO).data ?? [];
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black">
          Harga <span className="text-gradient">Akun</span>
        </h1>
        <p className="text-sm text-muted-foreground">Akun Blox Fruits siap pakai dari starter sampai pro.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {accounts.map((a: any) => {
            const ready = a.status === "ready" || a.status === "limited";
            // Setiap akun unik = maksimum 1
            const stock = a.status === "sold" ? 0 : 1;
            const meta = [
              a.level ? `Lv ${a.level}` : null,
              a.race ? `Race ${a.race}` : null,
              a.fruit ? `Fruit ${a.fruit}` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <ProductCard
                key={a.id}
                id={a.id}
                kind="account"
                name={a.name}
                price={Number(a.price)}
                image_url={a.image_url}
                alt_text={a.alt_text}
                stock={stock}
                ready={ready}
                category={a.status === "limited" ? "LIMITED" : "AKUN"}
                badge={a.status === "limited" ? "LIMITED" : null}
                meta={meta || a.description}
              />
            );
          })}
          {accounts.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Belum ada akun tersedia.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return accounts;
    return accounts.filter((a: any) =>
      [a.name, a.race, a.fruit, a.status, a.level]
        .filter((v: any) => v != null && v !== "")
        .some((v: any) => String(v).toLowerCase().includes(s)),
    );
  }, [accounts, q]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black">
          Harga <span className="text-gradient">Akun</span>
        </h1>
        <p className="text-sm text-muted-foreground">Akun Blox Fruits siap pakai dari starter sampai pro.</p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari akun... (nama, race, fruit)"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((a: any) => {
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
                priceRm={a.price_rm != null ? Number(a.price_rm) : null}
                image_url={a.image_url}
                alt_text={a.alt_text}
                stock={stock}
                ready={ready}
                category={a.status === "limited" ? "LIMITED" : "AKUN"}
                promoCategory={a.status}
                badge={a.status === "limited" ? "LIMITED" : null}
                meta={meta || a.description}
              />
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              {accounts.length === 0 ? "Belum ada akun tersedia." : "Nggak ada akun yang cocok."}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

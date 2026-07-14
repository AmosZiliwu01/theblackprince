import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { fruitsQO, categoriesQO } from "@/lib/site-queries";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/fruits")({
  head: () => ({
    meta: [
      { title: "Harga Fruit Blox Fruits — The Black Prince" },
      { name: "description", content: "Daftar harga & stok fruit Blox Fruits terbaru: Dough, Kitsune, Dragon, Buddha, Leopard, dan lainnya." },
      { property: "og:title", content: "Harga Fruit Blox Fruits" },
      { property: "og:description", content: "Cek harga fruit realtime — ready stock update." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(fruitsQO);
    context.queryClient.ensureQueryData(categoriesQO);
  },
  component: FruitsPage,
});

function FruitsPage() {
  const fruits = useQuery(fruitsQO).data ?? [];
  const cats = useQuery(categoriesQO).data ?? [];
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    return fruits.filter((f: any) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [fruits, q, cat]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-black">
          Harga <span className="text-gradient">Fruit</span>
        </h1>
        <p className="text-sm text-muted-foreground">Stok update realtime. Chat AI untuk cek fruit tertentu.</p>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari fruit... (dough, kitsune, dragon)"
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>Semua</Chip>
            {cats.map((c: any) => (
              <Chip key={c.id} active={cat === c.name} onClick={() => setCat(c.name)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((f: any) => (
            <ProductCard
              key={f.id}
              id={f.id}
              kind="fruit"
              name={f.name}
              price={Number(f.price)}
              image_url={f.image_url}
              alt_text={f.alt_text}
              stock={Number(f.stock ?? 0)}
              ready={Boolean(f.ready)}
              category={f.category}
              meta={f.description}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Nggak ada fruit yang cocok.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground shadow-neon"
          : "border-border bg-card text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

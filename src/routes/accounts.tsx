import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { accountsQO } from "@/lib/site-queries";

export const Route = createFileRoute("/accounts")({
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

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a: any) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-neon">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl gradient-primary">
                  <UserCircle2 className="h-5 w-5 text-primary-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{a.name}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">
                    {a.status === "limited" ? "LIMITED" : a.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <Stat label="Level" value={a.level ?? "-"} />
                <Stat label="Race" value={a.race ?? "-"} />
                <Stat label="Fruit" value={a.fruit ?? "-"} />
              </div>
              {a.description && (
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
              )}
              <p className="mt-3 text-xl font-black text-primary">
                Rp {Number(a.price).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
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

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/50 p-2 text-center">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-bold">{value}</p>
    </div>
  );
}

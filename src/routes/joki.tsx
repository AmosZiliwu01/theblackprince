import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { jokiQO } from "@/lib/site-queries";

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

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {joki.map((j: any) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60 hover:shadow-neon">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary shadow-neon">
                  <Wrench className="h-5 w-5 text-primary-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{j.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{j.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {j.estimation}
                  </p>
                </div>
                <p className="text-right text-lg font-black text-primary">
                  Rp {Number(j.price).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
          {joki.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Belum ada layanan joki aktif.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

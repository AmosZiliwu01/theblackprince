import { useQuery } from "@tanstack/react-query";
import { Percent } from "lucide-react";
import { promotionsQO } from "@/lib/site-queries";
import { isPromoLive, type Promotion } from "@/lib/discount";

export function PromoBanner() {
  const promos = (useQuery(promotionsQO).data ?? []) as Promotion[];
  const live = promos
    .filter((p) => isPromoLive(p))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (live.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {live.map((p) => (
          <div
            key={p.id}
            className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card"
          >
            {p.image_url && (
              <img src={p.image_url} alt={p.title} className="h-24 w-full object-cover opacity-60" />
            )}
            <div className={p.image_url ? "absolute inset-0 flex items-center gap-3 bg-black/50 p-4" : "flex items-center gap-3 p-4"}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-500 text-sm font-black text-white shadow-neon">
                -{Math.round(Number(p.discount_percent))}%
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">
                  <Percent className="mr-1 inline h-3.5 w-3.5 text-primary" />
                  {p.title}
                </p>
                {p.subtitle && <p className="truncate text-[11px] text-muted-foreground">{p.subtitle}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { bannersQO } from "@/lib/site-queries";

export function PromoStrip() {
  const { data: banners } = useQuery(bannersQO);
  const promo = (banners ?? []).find((b: any) => b.type === "promo" && b.active);

  if (!promo) return null;

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-primary/30">
      {promo.image_url ? (
        <div className="relative h-24 w-full sm:h-28">
          <img
            src={promo.image_url}
            alt={promo.title || "Promo"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
      ) : (
        <div className="h-24 w-full bg-gradient-to-r from-primary/30 to-secondary/30 sm:h-28" />
      )}

      <div className="absolute inset-0 flex items-center justify-between gap-3 px-5">
        <div className="min-w-0">
          {promo.title && (
            <p className="truncate text-base font-black text-white sm:text-lg">{promo.title}</p>
          )}
          {promo.subtitle && (
            <p className="mt-0.5 truncate text-xs text-white/80 sm:text-sm">{promo.subtitle}</p>
          )}
        </div>
        {promo.link && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-neon">
            Lihat <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (promo.link) {
    return (
      <section className="mx-auto max-w-6xl px-4 pt-4">
        <Link to={promo.link}>{content}</Link>
      </section>
    );
  }

  return <section className="mx-auto max-w-6xl px-4 pt-4">{content}</section>;
}
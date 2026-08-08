import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Apple,
  Wrench,
  UserCircle2,
  Users,
  Radio,
  Gift,
  CalendarRange,
  HelpCircle,
  MessageCircle,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

import { SiteLayout } from "@/components/site/site-layout";
import { ProductImage } from "@/components/product-image";
import {
  bannersQO,
  fruitsQO,
  jokiQO,
  liveStatusQO,
  giveawaysQO,
} from "@/lib/site-queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(bannersQO);
    context.queryClient.ensureQueryData(fruitsQO);
    context.queryClient.ensureQueryData(jokiQO);
    context.queryClient.ensureQueryData(liveStatusQO);
    context.queryClient.ensureQueryData(giveawaysQO);
  },
  component: HomePage,
});

const quickMenu = [
  { to: "/fruits", label: "Harga Fruit", icon: Apple, color: "from-orange-500/40 to-red-600/40" },
  { to: "/joki", label: "Jasa Joki", icon: Wrench, color: "from-orange-500/40 to-red-600/40" },
  { to: "/accounts", label: "Harga Akun", icon: UserCircle2, color: "from-orange-500/40 to-red-600/40" },
  { to: "/community", label: "Link", icon: Users, color: "from-orange-500/40 to-red-600/40" },
  { to: "/live", label: "TikTok Live", icon: Radio, color: "from-orange-500/40 to-red-600/40" },
  { to: "/giveaway", label: "Giveaway", icon: Gift, color: "from-orange-500/40 to-red-600/40" },
  { to: "/events", label: "Event", icon: CalendarRange, color: "from-orange-500/40 to-red-600/40" },
  { to: "/faq", label: "FAQ", icon: HelpCircle, color: "from-orange-500/40 to-red-600/40" },
] as const;

function HomePage() {
  const banners = useQuery(bannersQO).data ?? [];
  const fruits = useQuery(fruitsQO).data ?? [];
  const joki = useQuery(jokiQO).data ?? [];
  const live = useQuery(liveStatusQO).data as any;
  const giveaways = (useQuery(giveawaysQO).data ?? []).filter((g: any) => g.active);

  const hero = banners.find((b: any) => b.type === "hero" && b.active) || banners.find((b: any) => b.active);
  const featuredFruits = fruits.filter((f: any) => f.ready).slice(0, 6);
  const featuredJoki = joki.filter((j: any) => j.active).slice(0, 4);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:pt-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> ASSISTANT ADMIN AI · 24/7
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            <span className="block">Blox Fruits</span>
            <span className="text-gradient">Marketplace #1</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            {hero?.subtitle ??
              "Jual Fruit, Akun, Jasa Joki, Komunitas, Live TikTok & Giveaway. Semua di The Black Prince."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-neon animate-pulse-neon"
            >
              <MessageCircle className="h-4 w-4" /> Chat AI Admin
            </Link>
            <Link
              to="/fruits"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent"
            >
              <Apple className="h-4 w-4" /> Lihat Fruit
            </Link>
          </div>

          {live?.is_live && (
            <Link
              to="/live"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/50 bg-red-500/10 p-4"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-red-400">TikTok Live sekarang</p>
                <p className="truncate text-sm">{live?.title ?? "Admin sedang live"}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* QUICK MENU */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Menu</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-8">
          {quickMenu.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-neon"
              >
                <span
                  className={
                    "grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br " +
                    q.color +
                    " ring-1 ring-inset ring-white/10"
                  }
                >
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </span>
                <span className="text-[11px] font-medium leading-tight">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* GIVEAWAY BANNER */}
      {giveaways.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-2">
          <Link
            to="/giveaway"
            className="flex items-center gap-4 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/20 to-secondary/20 p-4"
          >
            <Gift className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase text-primary">Giveaway Aktif</p>
              <p className="truncate text-sm font-semibold">{giveaways[0].name}</p>
              <p className="truncate text-xs text-muted-foreground">Hadiah: {giveaways[0].prize}</p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              Ikut
            </span>
          </Link>
        </section>
      )}

      {/* FEATURED FRUITS */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">🔥 Fruit Ready</h2>
          <Link to="/fruits" className="text-xs font-semibold text-primary hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {featuredFruits.map((f: any) => (
            <Link
              to="/fruits/$id"
              params={{ id: f.id }}
              key={f.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/60 hover:shadow-neon"
            >
              <ProductImage
                src={f.image_url}
                alt={f.alt_text || f.name}
                kind="fruit"
                ratio="square"
                className="rounded-none"
              />
              <div className="p-2.5">
                <p className="truncate text-sm font-bold">{f.name}</p>
                <p className="text-[11px] uppercase text-muted-foreground">{f.category}</p>
                <p className="mt-1 text-sm font-black text-primary">Rp {Number(f.price).toLocaleString("id-ID")}</p>
                <p className="text-[11px] text-muted-foreground">
                  {f.stock > 0 ? `Stok: ${f.stock}` : "PO 1-3 hari"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED JOKI */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">⚡ Jasa Joki Populer</h2>
          <Link to="/joki" className="text-xs font-semibold text-primary hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {featuredJoki.map((j: any) => (
            <Link
              to="/joki/$id"
              params={{ id: j.id }}
              key={j.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-neon"
            >
              <div className="w-16 shrink-0">
                <ProductImage src={j.image_url} alt={j.alt_text || j.name} kind="joki" ratio="square" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{j.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{j.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">Estimasi: {j.estimation}</p>
              </div>
              <p className="shrink-0 text-right text-sm font-black text-primary">
                Rp {Number(j.price).toLocaleString("id-ID")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <Link
          to="/chat"
          className="flex items-center gap-4 rounded-2xl border border-primary/40 gradient-primary p-5 shadow-neon"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-background/20 backdrop-blur">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </span>
          <div className="min-w-0 flex-1 text-primary-foreground">
            <p className="text-xs font-bold uppercase opacity-90">Assistant Admin AI</p>
            <p className="text-lg font-black">Tanya apa aja, jawab realtime sesuai data</p>
            <p className="text-xs opacity-90">Harga · Stok · PS · Live · Giveaway · Event · FAQ</p>
          </div>
          <Crown className="hidden h-10 w-10 text-primary-foreground/70 md:block" />
        </Link>
      </section>
    </SiteLayout>
  );
}
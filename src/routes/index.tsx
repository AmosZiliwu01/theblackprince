import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Crown, ShoppingBag, MessageCircle, Heart, Users, Gamepad2, Link2, Wallet } from "lucide-react";
import { communityQO, websiteSettingsQO, linkGroupsQO } from "@/lib/site-queries";
import { PromoToast } from "@/components/site/promo-toast";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "The Black Prince Store — Semua Link Resmi" },
    { name: "description", content: "Temukan toko Blox Fruits, WhatsApp admin, grup komunitas, TikTok, dan semua link resmi The Black Prince Store." },
    { property: "og:title", content: "The Black Prince Store — Semua Link Resmi" },
    { property: "og:description", content: "Belanja Blox Fruits dan temukan semua link resmi The Black Prince Store dalam satu halaman." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(communityQO);
    context.queryClient.ensureQueryData(websiteSettingsQO);
    context.queryClient.ensureQueryData(linkGroupsQO);
  },
  component: LinksHome,
});

function linkIcon(platform: string, label: string) {
  const text = `${platform} ${label}`.toLowerCase();
  if (text.includes("whatsapp")) return MessageCircle;
  if (text.includes("grup") || text.includes("discord")) return Users;
  if (text.includes("saweria") || text.includes("donate")) return Heart;
  if (text.includes("roblox")) return Gamepad2;
  return Link2;
}

function LinksHome() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const settings = useQuery(websiteSettingsQO).data;
  const groupRows = useQuery(linkGroupsQO).data ?? [];
  const { data: rawLinks = [], isPending, isError } = useQuery(communityQO);
  const links = rawLinks.filter((link: any) => link.active && link.url);
  const inactive = new Set(groupRows.filter((g: any) => !g.active).map((g: any) => g.name));
  const groups = [...new Set([
    ...groupRows.filter((g: any) => g.active).map((g: any) => g.name as string),
    ...links.map((link: any) => link.link_group || "Lainnya"),
  ])].filter((g) => !inactive.has(g));
  const siteName = settings?.site_name || "The Black Prince";
  const waNumber = String(settings?.whatsapp_number ?? "").replace(/\D/g, "");

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-10 text-foreground sm:pt-16">
      <PromoToast />
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-primary/70 bg-card shadow-neon sm:h-28 sm:w-28">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={`Logo ${siteName}`} className="h-full w-full object-cover" />
            ) : (
              <Crown className="h-11 w-11 text-primary" aria-label={siteName} />
            )}
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">{siteName}</h1>
          <p className="mt-2 text-sm font-medium text-primary sm:text-base">{settings?.tagline || "Jual Buah, Akun, dan Jasa Blox Fruits terpercaya."}</p>
        </header>

        <Link to="/store" className="group flex min-h-16 items-center gap-4 rounded-md border border-primary/60 gradient-primary px-5 py-4 text-primary-foreground shadow-neon transition hover:brightness-110">
          <ShoppingBag className="h-6 w-6 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-extrabold">{settings?.store_cta_title || "Beli di The Black Prince Store"}</span>
            {settings?.store_cta_description && <span className="mt-0.5 block text-xs opacity-90">{settings.store_cta_description}</span>}
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>

        {settings?.payment_enabled && (
          <section className="mt-9" aria-label="Pembayaran">
            <Button variant="outline" aria-expanded={paymentOpen} aria-controls="payment-details" onClick={() => setPaymentOpen((open) => !open)} className="flex h-auto min-h-16 w-full justify-start gap-4 border-border bg-card px-4 py-3 text-left hover:border-primary/70">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/15 text-primary"><Wallet className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold">Pembayaran</span><span className="block text-xs font-normal text-muted-foreground">QRIS, DANA / GoPay, atau WhatsApp</span></span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${paymentOpen ? "rotate-180" : ""}`} />
            </Button>
            {paymentOpen && <div id="payment-details" className="mt-2 rounded-md border border-border bg-card p-4 text-center">
              {settings.payment_qris_url && (
                <img src={settings.payment_qris_url} alt="QRIS pembayaran" className="mx-auto mb-3 w-full max-w-64 rounded-md bg-background object-contain" />
              )}
              {settings.payment_wallet_number && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground">DANA / GoPay</p>
                  <Button variant="ghost"
                    onClick={() => navigator.clipboard?.writeText(settings.payment_wallet_number)}
                    className="mt-1 h-auto text-lg font-black text-primary"
                    title="Salin nomor"
                  >
                    {settings.payment_wallet_number}
                  </Button>
                </div>
              )}
              {settings.payment_note && <p className="whitespace-pre-line text-xs text-muted-foreground">{settings.payment_note}</p>}
              {waNumber && (
                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo admin, saya minta info pembayaran (QRIS/DANA/GoPay).")}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/60 px-3 py-2 text-xs font-bold text-primary">
                  <MessageCircle className="h-4 w-4" /> Minta lewat WhatsApp
                </a>
              )}
            </div>}
          </section>
        )}


        {groups.map((group) => {
          const items = links.filter((link: any) => (link.link_group || "Sosial & Roblox") === group);
          if (!items.length) return null;
          return (
            <section key={group} className="mt-9" aria-label={group}>
              <div className="mb-3 border-b border-border pb-2">
                <h2 className="text-sm font-bold text-foreground">{group}</h2>
              </div>
              <div className="grid gap-2.5">
                {items.map((link: any) => {
                  const Icon = linkIcon(link.platform, link.label);
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition hover:border-primary/70 hover:bg-accent/40">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/15 text-primary"><Icon className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold leading-snug">{link.label}</span>
                        {link.description && <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{link.description}</span>}
                        {link.note && <span className="mt-1 block text-xs text-primary">{link.note}</span>}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
        {isPending && <p className="mt-8 text-center text-sm text-muted-foreground">Memuat link...</p>}
        {isError && <p className="mt-8 text-center text-sm text-muted-foreground">Link belum bisa dimuat. Coba lagi nanti.</p>}
        <footer className="mt-12 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} The Black Prince Store</footer>
      </div>
    </main>
  );
}

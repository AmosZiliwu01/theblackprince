import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Home,
  Apple,
  Wrench,
  UserCircle2,
  Users,
  ArrowLeftRight,
  Gift,
  CalendarRange,
  HelpCircle,
  MessageCircle,
  Crown,
  ShoppingCart,
} from "lucide-react";
import { AnnouncementBar } from "./announcement-bar";
import { PopupBanner } from "./popup-banner";
import { PromoToast } from "./promo-toast";
import { useCart } from "@/lib/cart-context";
import { websiteSettingsQO } from "@/lib/site-queries";

// Mobile bottom nav: Home, Fruit, Joki, Akun, AI (no Cart — cart lives in header)
const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/fruits", label: "Fruit", icon: Apple },
  { to: "/joki", label: "Joki", icon: Wrench },
  { to: "/accounts", label: "Akun", icon: UserCircle2 },
  { to: "/chat", label: "AI", icon: MessageCircle },
];

// Desktop nav — single row, no duplicate AI Assistant/Chat AI entry
const drawerLinks = [
  { to: "/fruits", label: "Harga Fruit", icon: Apple },
  { to: "/joki", label: "Jasa Joki", icon: Wrench },
  { to: "/accounts", label: "Harga Akun", icon: UserCircle2 },
  { to: "/community", label: "Link", icon: Users },
  { to: "/calculator-trade", label: "Calculator", icon: ArrowLeftRight },
  { to: "/trade", label: "Trade", icon: ArrowLeftRight },
  { to: "/giveaway", label: "Giveaway", icon: Gift },
  { to: "/events", label: "Event", icon: CalendarRange },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
];


function LogoMark({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg shadow-neon">
        <img
          src={logoUrl}
          alt="Logo"
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fall back visually if the URL is broken — hide the broken
            // image icon rather than showing browser's default alt box.
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </span>
    );
  }
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-primary shadow-neon">
      <Crown className="h-5 w-5 text-primary-foreground" />
    </span>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { totalItems } = useCart();
  const settings = useQuery(websiteSettingsQO).data as any;

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <PopupBanner />
      <PromoToast />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2 font-black tracking-tight">
            <LogoMark logoUrl={settings?.logo_url} />
            <span className="truncate text-sm leading-none sm:text-lg">
              THE <span className="text-gradient">BLACK PRINCE <br></br> STORE</span>
            </span>
          </Link>
          <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto whitespace-nowrap lg:flex">
            {drawerLinks.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={
                    "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors " +
                    (active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <NotificationBell />
            <Link

              to="/cart"
              aria-label="Keranjang"
              className="relative grid h-9 w-9 place-items-center rounded-md border border-border bg-card hover:bg-accent"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground shadow-neon">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <Link
              to="/chat"
              className="hidden shrink-0 rounded-md gradient-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-neon sm:inline-flex"
            >
              Chat AI
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      <footer className="hidden border-t border-border/60 bg-card/60 py-8 md:block">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <LogoMark logoUrl={settings?.logo_url} />
            {settings?.site_name || "The Black Prince"}
          </div>
          <p>{settings?.tagline || "Blox Fruits Marketplace · Fruit · Akun · Joki · Community"}</p>
          <p className="text-xs">© {new Date().getFullYear()} {settings?.site_name || "The Black Prince"}. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile bottom nav: Home, Fruit, Joki, Akun, AI */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-lg md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {nav.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors " +
                  (active ? "text-primary" : "text-muted-foreground")
                }
              >
                <Icon
                  className={
                    "h-5 w-5 " + (active ? "drop-shadow-[0_0_8px_var(--neon)]" : "")
                  }
                />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home,
  Apple,
  Wrench,
  UserCircle2,
  Users,
  Radio,
  Gift,
  CalendarRange,
  HelpCircle,
  MessageCircle,
  Crown,
  ShoppingCart,
} from "lucide-react";
import { AnnouncementBar } from "./announcement-bar";
import { useCart } from "@/lib/cart-context";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/fruits", label: "Fruit", icon: Apple },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/joki", label: "Joki", icon: Wrench },
  { to: "/chat", label: "AI", icon: MessageCircle },
];

const drawerLinks = [
  { to: "/fruits", label: "Harga Fruit", icon: Apple },
  { to: "/joki", label: "Jasa Joki", icon: Wrench },
  { to: "/accounts", label: "Harga Akun", icon: UserCircle2 },
  { to: "/community", label: "Komunitas", icon: Users },
  { to: "/live", label: "Live TikTok", icon: Radio },
  { to: "/giveaway", label: "Giveaway", icon: Gift },
  { to: "/events", label: "Event", icon: CalendarRange },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/chat", label: "AI Assistant", icon: MessageCircle },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { totalItems } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-neon">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-lg leading-none">
              THE <span className="text-gradient">BLACK PRINCE</span>
            </span>
          </Link>
          <nav className="ml-auto hidden gap-1 md:flex">
            {drawerLinks.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
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
          <Link
            to="/cart"
            aria-label="Keranjang"
            className="relative ml-auto grid h-9 w-9 place-items-center rounded-md border border-border bg-card hover:bg-accent md:ml-2"
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
            className="hidden rounded-md gradient-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-neon md:inline-flex"
          >
            Chat AI
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-6">{children}</main>

      <footer className="hidden border-t border-border/60 bg-card/60 py-8 md:block">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Crown className="h-4 w-4 text-primary" /> The Black Prince
          </div>
          <p>Blox Fruits Marketplace · Fruit · Akun · Joki · Community</p>
          <p className="text-xs">© {new Date().getFullYear()} The Black Prince. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-lg md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {nav.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            const showBadge = l.to === "/cart" && totalItems > 0;
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
                {showBadge && (
                  <span className="absolute right-1/4 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

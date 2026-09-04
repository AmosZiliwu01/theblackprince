import { Link } from "@tanstack/react-router";
import { Hammer, ArrowLeftRight, Home } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";

/**
 * Placeholder sementara untuk fitur Trade yang sedang diperbaiki
 * (login sederhana, buat trade, chat, notifikasi).
 */
export function TradeComingSoon() {
  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-2xl place-items-center px-4 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-neon">
          <Hammer className="h-7 w-7 text-primary-foreground" />
        </span>
        <h1 className="mt-5 text-2xl font-black sm:text-3xl">
          Fitur Trade <span className="text-gradient">Coming Soon</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Fitur Trade (buat penawaran, chat, & notifikasi) lagi kami rapiin biar lebih simpel dan
          enak dipakai — termasuk login cepat tanpa ribet. Sabar bentar ya, bang!
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Sementara itu, Calculator Trade tetap bisa dipakai untuk cek value item.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/calculator-trade"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-neon"
          >
            <ArrowLeftRight className="h-4 w-4" /> Calculator Trade
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold"
          >
            <Home className="h-4 w-4" /> Kembali ke Home
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}

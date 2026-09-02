import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/calculator-trade", label: "Calculator Trade" },
  { to: "/trade", label: "Semua Trade" },
  { to: "/trade/new", label: "Buat Trade" },
  { to: "/trade/mine", label: "Trade Saya" },
] as const;

/** Sub-navigasi fitur Trade, dipakai di semua halaman Trade (mobile & desktop). */
export function TradeNav() {
  return (
    <nav className="mb-4 flex flex-wrap gap-1.5 overflow-x-auto">
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          activeOptions={{ exact: true }}
          activeProps={{ className: "border-primary bg-primary/20 text-primary" }}
          inactiveProps={{ className: "border-border text-muted-foreground hover:text-foreground" }}
          className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

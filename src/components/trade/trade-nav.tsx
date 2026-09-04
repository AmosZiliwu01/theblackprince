import { Link } from "@tanstack/react-router";

/** Sub-navigasi fitur Trade. Sementara hanya Calculator yang aktif. */
export function TradeNav() {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 overflow-x-auto">
      <Link
        to="/calculator-trade"
        activeOptions={{ exact: true }}
        activeProps={{ className: "border-primary bg-primary/20 text-primary" }}
        inactiveProps={{ className: "border-border text-muted-foreground hover:text-foreground" }}
        className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
      >
        Calculator Trade
      </Link>
      <span className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">
        Trade · Coming Soon
      </span>
    </nav>
  );
}

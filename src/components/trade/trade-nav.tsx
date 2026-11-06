import { Link } from "@tanstack/react-router";

const CLS = "min-w-0 rounded-full border px-2.5 py-2 text-center text-xs font-bold transition-colors sm:shrink-0 sm:px-3 sm:py-1.5";
const ACTIVE = { className: "border-primary bg-primary/20 text-primary" };
const INACTIVE = { className: "border-border text-muted-foreground hover:text-foreground" };

/** Sub-navigasi fitur Trade. */
export function TradeNav() {
  return (
    <nav className="mb-4 grid grid-cols-2 gap-1.5 pb-1 sm:flex sm:flex-wrap sm:items-center">
      <Link to="/calculator-trade" activeOptions={{ exact: true }} activeProps={ACTIVE} inactiveProps={INACTIVE} className={CLS}>
        Calculator Trade
      </Link>
      <Link to="/trade" activeOptions={{ exact: true }} activeProps={ACTIVE} inactiveProps={INACTIVE} className={CLS}>
        Penawaran
      </Link>
      <Link to="/trade/new" activeProps={ACTIVE} inactiveProps={INACTIVE} className={CLS}>
        Buat Trade
      </Link>
      <Link to="/trade/mine" activeProps={ACTIVE} inactiveProps={INACTIVE} className={CLS}>
        Trade Saya
      </Link>
    </nav>
  );
}

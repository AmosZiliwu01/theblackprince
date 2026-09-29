import { Link } from "@tanstack/react-router";

const CLS = "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors";
const ACTIVE = { className: "border-primary bg-primary/20 text-primary" };
const INACTIVE = { className: "border-border text-muted-foreground hover:text-foreground" };

/** Sub-navigasi fitur Trade. */
export function TradeNav() {
  return (
    <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
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

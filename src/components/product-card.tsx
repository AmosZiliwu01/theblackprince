import { ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { ProductImage } from "./product-image";
import { useCart, type CartKind } from "@/lib/cart-context";

interface ProductCardProps {
  id: string;
  kind: CartKind;
  name: string;
  price: number;
  image_url?: string | null;
  alt_text?: string | null;
  stock: number | null; // null = unlimited slot (joki)
  ready: boolean;
  category?: string | null;
  badge?: string | null;
  meta?: string;
  description?: string | null;
}

const DETAIL_ROUTE: Record<CartKind, "/fruits/$id" | "/joki/$id" | "/accounts/$id"> = {
  fruit: "/fruits/$id",
  joki: "/joki/$id",
  account: "/accounts/$id",
};

export function ProductCard(p: ProductCardProps) {
  const cart = useCart();
  const navigate = useNavigate();

  const soldOut = !p.ready || (p.stock != null && p.stock <= 0);

  function add(silent = false) {
    if (soldOut) {
      toast.error("Stok habis bang.");
      return false;
    }
    cart.add({
      id: p.id,
      kind: p.kind,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      maxStock: p.stock,
      meta: p.meta,
    });
    if (!silent) toast.success(`${p.name} masuk keranjang`);
    return true;
  }

  return (
    <div
      className={
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition " +
        (soldOut
          ? "border-border/40 opacity-70"
          : "border-border hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-neon")
      }
    >
      <Link
        to={DETAIL_ROUTE[p.kind]}
        params={{ id: p.id }}
        className="relative block"
      >
        <ProductImage src={p.image_url} alt={p.alt_text || p.name} kind={p.kind} />
        {p.category && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {p.category}
          </span>
        )}
        {p.badge && (
          <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow-neon">
            {p.badge}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-black/60">
            <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
              Sold Out
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link
          to={DETAIL_ROUTE[p.kind]}
          params={{ id: p.id }}
          className="min-w-0"
        >
          <p className="line-clamp-1 text-sm font-bold hover:text-primary">{p.name}</p>
        </Link>
        {p.meta && <p className="line-clamp-1 text-[11px] text-muted-foreground">{p.meta}</p>}
        <p className="mt-auto text-base font-black text-primary">
          Rp {Number(p.price).toLocaleString("id-ID")}
        </p>
        <div className="flex items-center justify-between text-[11px]">
          <span className={soldOut ? "text-red-400" : "text-emerald-400"}>
            {soldOut ? "SOLD" : "READY"}
          </span>
          {p.stock != null && !soldOut && (
            <span className="text-muted-foreground">Stok: {p.stock}</span>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => add()}
            disabled={soldOut}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-2 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Cart
          </button>
          <button
            onClick={() => {
              if (add(true)) navigate({ to: "/cart" });
            }}
            disabled={soldOut}
            className="inline-flex items-center justify-center gap-1 rounded-lg gradient-primary px-2 py-1.5 text-xs font-bold text-primary-foreground shadow-neon transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" /> Beli
          </button>
        </div>
      </div>
    </div>
  );
}
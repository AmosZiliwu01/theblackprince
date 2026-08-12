import { DescriptionRenderer } from "@/components/site/description";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { fruitsQO } from "@/lib/site-queries";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/lib/cart-context";
import { formatDualPrice } from "@/lib/currency";

export const Route = createFileRoute("/fruits/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(fruitsQO),
  component: FruitDetailPage,
});

function FruitDetailPage() {
  const { id } = Route.useParams();
  const fruits = useQuery(fruitsQO).data ?? [];
  const cart = useCart();
  const navigate = useNavigate();
  const f = fruits.find((x: any) => x.id === id);

  if (!f) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Fruit tidak ditemukan.</p>
          <Link to="/fruits" className="mt-4 inline-block text-primary hover:underline">
            ← Kembali ke daftar fruit
          </Link>
        </section>
      </SiteLayout>
    );
  }

  const soldOut = !f.ready || Number(f.stock ?? 0) <= 0;

  function add(silent = false) {
    if (soldOut) {
      toast.error("Stok habis bang.");
      return false;
    }
    cart.add({
      id: f.id,
      kind: "fruit",
      name: f.name,
      price: Number(f.price),
      image_url: f.image_url,
      maxStock: Number(f.stock ?? 0),
      meta: f.category,
    });
    if (!silent) toast.success(`${f.name} masuk keranjang`);
    return true;
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/fruits" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="grid gap-6 sm:grid-cols-2">
          <ProductImage src={f.image_url} alt={f.alt_text || f.name} kind="fruit" ratio="square" />

          <div>
            {f.category && (
              <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase text-primary">
                {f.category}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-black">{f.name}</h1>
            <p className="mt-2 text-2xl font-black text-primary">
              {formatDualPrice(Number(f.price), f.price_rm != null ? Number(f.price_rm) : null)}
            </p>
            <p className={"mt-1 text-sm font-bold " + (soldOut ? "text-red-400" : "text-emerald-400")}>
              {soldOut ? "SOLD OUT" : `READY${f.stock ? ` — Stok: ${f.stock}` : ""}`}
            </p>
            <DescriptionRenderer text={f.description} className="mt-4 text-muted-foreground" />

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => add()}
                disabled={soldOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" /> Cart
              </button>
              <button
                onClick={() => {
                  if (add(true)) navigate({ to: "/cart" });
                }}
                disabled={soldOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-neon hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap className="h-4 w-4" /> Beli
              </button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
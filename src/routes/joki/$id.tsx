import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { jokiQO } from "@/lib/site-queries";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/joki/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(jokiQO),
  component: JokiDetailPage,
});

function JokiDetailPage() {
  const { id } = Route.useParams();
  const joki = useQuery(jokiQO).data ?? [];
  const cart = useCart();
  const navigate = useNavigate();
  const j = joki.find((x: any) => x.id === id);

  if (!j) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Layanan joki tidak ditemukan.</p>
          <Link to="/joki" className="mt-4 inline-block text-primary hover:underline">
            ← Kembali ke daftar joki
          </Link>
        </section>
      </SiteLayout>
    );
  }

  const stock = j.stock == null ? null : Number(j.stock);
  const soldOut = !j.active || (stock != null && stock <= 0);

  function add(silent = false) {
    if (soldOut) {
      toast.error("Slot habis bang.");
      return false;
    }
    cart.add({
      id: j.id,
      kind: "joki",
      name: j.name,
      price: Number(j.price),
      image_url: j.image_url,
      maxStock: stock,
      meta: j.description,
    });
    if (!silent) toast.success(`${j.name} masuk keranjang`);
    return true;
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/joki" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="grid gap-6 sm:grid-cols-2">
          <ProductImage src={j.image_url} alt={j.alt_text || j.name} kind="joki" ratio="square" />

          <div>
            {j.category && (
              <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase text-primary">
                {j.category}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-black">{j.name}</h1>
            <p className="mt-2 text-2xl font-black text-primary">
              Rp {Number(j.price).toLocaleString("id-ID")}
            </p>
            <p className={"mt-1 text-sm font-bold " + (soldOut ? "text-red-400" : "text-emerald-400")}>
              {soldOut ? "TIDAK TERSEDIA" : `TERSEDIA${stock != null ? ` — Slot: ${stock}` : ""}`}
            </p>
            {j.estimation && (
              <p className="mt-2 text-sm text-muted-foreground">Estimasi: {j.estimation}</p>
            )}
            {j.description && (
              <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{j.description}</p>
            )}

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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { accountsQO } from "@/lib/site-queries";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/accounts/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountsQO),
  component: AccountDetailPage,
});

function AccountDetailPage() {
  const { id } = Route.useParams();
  const accounts = useQuery(accountsQO).data ?? [];
  const cart = useCart();
  const navigate = useNavigate();
  const a = accounts.find((x: any) => x.id === id);

  if (!a) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Akun tidak ditemukan.</p>
          <Link to="/accounts" className="mt-4 inline-block text-primary hover:underline">
            ← Kembali ke daftar akun
          </Link>
        </section>
      </SiteLayout>
    );
  }

  const ready = a.status === "ready" || a.status === "limited";
  const soldOut = !ready;
  const meta = [
    a.level ? `Lv ${a.level}` : null,
    a.race ? `Race ${a.race}` : null,
    a.fruit ? `Fruit ${a.fruit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function add(silent = false) {
    if (soldOut) {
      toast.error("Akun sudah terjual.");
      return false;
    }
    cart.add({
      id: a.id,
      kind: "account",
      name: a.name,
      price: Number(a.price),
      image_url: a.image_url,
      maxStock: 1,
      meta: meta || a.description,
    });
    if (!silent) toast.success(`${a.name} masuk keranjang`);
    return true;
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/accounts" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="grid gap-6 sm:grid-cols-2">
          <ProductImage src={a.image_url} alt={a.alt_text || a.name} kind="account" ratio="square" />

          <div>
            {a.status === "limited" && (
              <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground">
                LIMITED
              </span>
            )}
            <h1 className="mt-2 text-2xl font-black">{a.name}</h1>
            {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
            <p className="mt-2 text-2xl font-black text-primary">
              Rp {Number(a.price).toLocaleString("id-ID")}
            </p>
            <p className={"mt-1 text-sm font-bold " + (soldOut ? "text-red-400" : "text-emerald-400")}>
              {soldOut ? "SOLD" : "READY"}
            </p>
            {a.description && (
              <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{a.description}</p>
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
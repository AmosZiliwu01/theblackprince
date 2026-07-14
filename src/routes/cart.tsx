import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { useCart } from "@/lib/cart-context";
import { websiteSettingsQO } from "@/lib/site-queries";
import { ProductImage } from "@/components/product-image";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Keranjang — The Black Prince" },
      { name: "description", content: "Review pesanan Blox Fruits kamu sebelum checkout." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(websiteSettingsQO),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, remove, totalItems, totalPrice, clear } = useCart();
  const settings = useQuery(websiteSettingsQO).data as any;
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <ShoppingBag className="mr-2 inline h-7 w-7 text-primary" />
          Keranjang <span className="text-gradient">Kamu</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalItems === 0 ? "Belum ada item." : `${totalItems} item siap dipesan.`}
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Keranjang kosong. Yuk pilih fruit atau joki dulu.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link to="/fruits" className="rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-neon">
                Belanja Fruit
              </Link>
              <Link to="/joki" className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-accent">
                Lihat Joki
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_320px]">
            <div className="space-y-2">
              {items.map((it) => {
                const cap = it.maxStock == null ? Infinity : it.maxStock;
                const atCap = it.qty >= cap;
                return (
                  <div key={it.kind + ":" + it.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                    <div className="h-20 w-20 shrink-0">
                      <ProductImage src={it.image_url} alt={it.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold">{it.name}</p>
                      <p className="text-[11px] uppercase text-muted-foreground">{it.kind}</p>
                      {it.meta && <p className="line-clamp-1 text-[11px] text-muted-foreground">{it.meta}</p>}
                      <p className="mt-1 text-sm font-black text-primary">
                        Rp {Number(it.price).toLocaleString("id-ID")}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-border bg-background">
                          <button
                            onClick={() => updateQty(it.id, it.kind, it.qty - 1)}
                            disabled={it.qty <= 1}
                            aria-label="Kurangi"
                            className="p-1.5 disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[2ch] px-2 text-center text-sm font-bold">{it.qty}</span>
                          <button
                            onClick={() => updateQty(it.id, it.kind, it.qty + 1)}
                            disabled={atCap}
                            aria-label="Tambah"
                            className="p-1.5 disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(it.id, it.kind)}
                          className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {it.maxStock != null && (
                        <p className="mt-1 text-[10px] text-muted-foreground">Maks: {it.maxStock}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  if (confirm("Kosongkan keranjang?")) clear();
                }}
                className="text-xs text-muted-foreground hover:text-red-400"
              >
                Kosongkan keranjang
              </button>
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-4 md:sticky md:top-20">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ringkasan</p>
              <div className="mt-2 flex justify-between text-sm">
                <span>Item</span>
                <span>{totalItems}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-bold">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="mt-3 border-t border-border pt-3 text-sm">
                <div className="flex justify-between font-black">
                  <span>Total</span>
                  <span className="text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-3 text-sm font-black text-primary-foreground shadow-neon hover:brightness-110"
              >
                Lanjut Checkout <ArrowRight className="h-4 w-4" />
              </button>
              {!settings?.whatsapp_number && (
                <p className="mt-3 text-[10px] text-yellow-400">
                  Admin belum set nomor WhatsApp — checkout tetap bisa direview tapi pesan tidak akan terkirim.
                </p>
              )}
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

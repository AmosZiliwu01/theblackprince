import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Loader2, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { useCart } from "@/lib/cart-context";
import { revalidateCart } from "@/lib/cart-validate";
import { websiteSettingsQO } from "@/lib/site-queries";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — The Black Prince" },
      { name: "description", content: "Selesaikan pemesanan Blox Fruits via WhatsApp." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(websiteSettingsQO),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalItems, totalPrice, updateQty, remove } = useCart();
  const settings = useQuery(websiteSettingsQO).data as any;
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [issues, setIssues] = useState<any[]>([]);

  async function handleCheckout() {
    if (items.length === 0) {
      toast.error("Keranjang kosong.");
      return;
    }
    if (!name.trim()) {
      toast.error("Isi nama dulu bang.");
      return;
    }
    setBusy(true);
    setIssues([]);
    try {
      const res = await revalidateCart(items);
      if (!res.ok) {
        setIssues(res.issues);
        toast.error("Stok telah berubah. Silakan perbarui keranjang Anda.");
        // auto-fix cart to latest stock
        for (const iss of res.issues) {
          if (!iss.exists || !iss.ready) {
            remove(iss.item.id, iss.item.kind);
          } else if (iss.latestStock != null && iss.item.qty > iss.latestStock) {
            if (iss.latestStock <= 0) remove(iss.item.id, iss.item.kind);
            else updateQty(iss.item.id, iss.item.kind, iss.latestStock);
          }
        }
        return;
      }

      const wa = (settings?.whatsapp_number || "").replace(/\D/g, "");
      if (!wa) {
        toast.error("Nomor WhatsApp admin belum diset.");
        return;
      }

      const storeName = settings?.site_name || "The Black Prince";

      const lines: string[] = [];
      lines.push(settings?.whatsapp_greeting || "Halo admin The Black Prince, saya mau order:");
      lines.push("");
      lines.push(`Nama: ${name.trim()}`);
      lines.push("");
      lines.push("*Detail Pesanan:*");
      items.forEach((it, idx) => {
        const sub = it.qty * Number(it.price);
        lines.push(`${idx + 1}. ${it.name} (${it.kind}) x${it.qty} = Rp ${sub.toLocaleString("id-ID")}`);
      });
      lines.push("");
      lines.push(`*Total: Rp ${totalPrice.toLocaleString("id-ID")}*`);
      if (note.trim()) {
        lines.push("");
        lines.push(`Catatan: ${note.trim()}`);
      }
      lines.push("");
      lines.push(`Pesanan dari: ${storeName}`);

      const url = `https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Pesan WhatsApp dibuka!");
    } catch (e: any) {
      console.error(e);
      toast.error("Gagal validasi. Coba lagi ya.");
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-4 py-16 text-center">
          <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-black">Keranjang kosong</h1>
          <p className="mt-2 text-sm text-muted-foreground">Yuk pilih fruit dulu.</p>
          <Link to="/fruits" className="mt-4 inline-flex rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-neon">
            Belanja
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">Checkout</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Order via WhatsApp — admin bakal balas cepat.
        </p>

        {issues.length > 0 && (
          <div className="mt-4 rounded-2xl border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm">
            <p className="flex items-center gap-2 font-bold text-yellow-400">
              <AlertTriangle className="h-4 w-4" /> Stok telah berubah
            </p>
            <p className="mt-1 text-xs text-yellow-200/80">Keranjang sudah kami sesuaikan otomatis. Review lagi ya.</p>
            <ul className="mt-2 space-y-1 text-xs">
              {issues.map((i, idx) => (
                <li key={idx}>
                  • <b>{i.item.name}</b>: {i.reason}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate({ to: "/cart" })}
              className="mt-3 rounded-lg border border-yellow-500/60 bg-yellow-500/20 px-3 py-1.5 text-xs font-bold text-yellow-100"
            >
              Perbarui Keranjang
            </button>
          </div>
        )}

        <div className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Nama Kamu *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Roblox / Nama panggilan"
              maxLength={80}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Catatan (opsional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="Minta jam pengiriman, request khusus, dll."
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ringkasan</p>
          {items.map((it) => (
            <div key={it.kind + ":" + it.id} className="flex justify-between text-sm">
              <span className="line-clamp-1">
                {it.name} <span className="text-muted-foreground">x{it.qty}</span>
              </span>
              <span className="font-semibold">Rp {(it.qty * Number(it.price)).toLocaleString("id-ID")}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-black">
            <span>Total ({totalItems} item)</span>
            <span className="text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={busy}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-3 text-sm font-black text-primary-foreground shadow-neon hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
          Pesan via WhatsApp
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Kami validasi stok terbaru sebelum kirim pesan WhatsApp.
        </p>
      </section>
    </SiteLayout>
  );
}
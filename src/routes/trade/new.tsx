import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { TradeNav } from "@/components/trade/trade-nav";
import { ItemPicker } from "@/components/trade/item-picker";
import { tradeItemsQO } from "@/lib/site-queries";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/use-auth";
import { formatValue, rowKey, variantValue, VARIANT_LABEL, type TradeItem, type TradeVariant } from "@/lib/trade";
import type { DraftRow } from "@/lib/trade-offers";

const sb = supabase as any;

export const Route = createFileRoute("/trade/new")({
  head: () => ({
    meta: [
      { title: "Buat Penawaran Trade — The Black Prince" },
      { name: "description", content: "Buat penawaran trade Blox Fruits: pilih item yang kamu berikan dan yang kamu cari." },
      { property: "og:title", content: "Buat Penawaran Trade — The Black Prince" },
      { property: "og:description", content: "Posting penawaran trade Blox Fruits kamu ke komunitas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tradeItemsQO),
  component: NewTradePage,
});

type Side = "offer" | "request";

function NewTradePage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const items = (useQuery(tradeItemsQO).data ?? []) as TradeItem[];

  const [give, setGive] = useState<DraftRow[]>([]);
  const [want, setWant] = useState<DraftRow[]>([]);
  const [picker, setPicker] = useState<Side | null>(null);
  const [saving, setSaving] = useState(false);

  const rowValue = (r: DraftRow) => variantValue(r.item, r.variant);
  const sum = (rows: DraftRow[]) => rows.reduce((a, r) => a + (rowValue(r) ?? 0) * Math.max(1, r.qty), 0);

  const add = (side: Side, item: TradeItem, variant: TradeVariant, qty: number) => {
    const setter = side === "offer" ? setGive : setWant;
    const key = rowKey(item, variant);
    setter((rows) => {
      const i = rows.findIndex((r) => r.key === key);
      if (i >= 0) {
        const next = [...rows];
        next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
        return next;
      }
      return [...rows, { key, item, variant, qty }];
    });
    setPicker(null);
  };

  async function submit() {
    if (!user) return;
    if (give.length === 0 || want.length === 0) return toast.error("Isi minimal 1 item di kedua sisi");

    setSaving(true);
    try {
      const { data: prof } = await sb.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      const who = (prof?.display_name as string | null) ?? "Trader";
      const names = (rows: DraftRow[]) =>
        rows
          .slice(0, 2)
          .map((r) => `${r.qty > 1 ? r.qty + "x " : ""}${VARIANT_LABEL[r.variant] === "Permanent" ? "Perm " : ""}${r.item.name}`)
          .join(", ") + (rows.length > 2 ? ` +${rows.length - 2}` : "");
      const autoTitle = `${who}: ${names(give)} → ${names(want)}`;
      const { data: offer, error } = await sb
        .from("trade_offers")
        .insert({
          user_id: user.id,
          title: autoTitle.slice(0, 120),
          note: null,
          contact: null,
          status: "active",
          offer_value: sum(give),
          request_value: sum(want),
        })
        .select("id")
        .single();
      if (error) throw error;

      const rows = [
        ...give.map((r) => ({ side: "offer", r })),
        ...want.map((r) => ({ side: "request", r })),
      ].map(({ side, r }) => ({
        offer_id: offer.id,
        side,
        item_id: r.item.id,
        item_name: r.item.name,
        image_url: r.item.image_url,
        variant: r.variant,
        qty: Math.max(1, r.qty),
        value: rowValue(r),
      }));

      const { error: e2 } = await sb.from("trade_offer_items").insert(rows);
      if (e2) throw e2;

      qc.invalidateQueries({ queryKey: ["trade"] });
      toast.success("Penawaran trade dibuat");
      navigate({ to: "/trade/$id", params: { id: offer.id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal membuat penawaran");
    } finally {
      setSaving(false);
    }
  }

  if (user === undefined) {
    return (
      <SiteLayout>
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (user === null) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-black">Masuk dulu untuk membuat trade</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Penawaran trade terhubung ke akunmu supaya pembeli bisa chat langsung.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-2xl gradient-primary px-5 py-2.5 text-sm font-black text-primary-foreground shadow-neon"
          >
            Masuk / Daftar
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <TradeNav />
        <h1 className="text-2xl font-black md:text-3xl">
          Buat <span className="text-gradient">Trade</span>
        </h1>

        <p className="mt-1 text-xs text-muted-foreground">
          Pilih item yang kamu berikan dan yang kamu cari. Judul penawaran dibuat otomatis dari namamu dan itemnya.
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <SideEditor title="Saya Memberi" rows={give} setRows={setGive} onAdd={() => setPicker("offer")} total={sum(give)} />
          <SideEditor title="Saya Mencari" rows={want} setRows={setWant} onAdd={() => setPicker("request")} total={sum(want)} />
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-4 w-full rounded-2xl gradient-primary py-3 text-sm font-black text-primary-foreground shadow-neon disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Posting Penawaran"}
        </button>
      </section>

      {picker && (
        <ItemPicker
          items={items}
          addLabel="Tambahkan ke Penawaran"
          onAdd={(it, v, qty) => add(picker, it, v, qty)}
          onClose={() => setPicker(null)}
        />
      )}
    </SiteLayout>
  );
}

function SideEditor({
  title,
  rows,
  setRows,
  onAdd,
  total,
}: {
  title: string;
  rows: DraftRow[];
  setRows: (fn: (r: DraftRow[]) => DraftRow[]) => void;
  onAdd: () => void;
  total: number;
}) {
  const setQty = (key: string, d: number) =>
    setRows((r) => r.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(99, x.qty + d)) } : x)));

  return (
    <div className="rounded-3xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-black">{title}</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-xl gradient-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-neon"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          Belum ada item.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
              <img
                src={r.item.image_url ?? ""}
                alt={r.item.name}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg bg-muted object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{r.item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {VARIANT_LABEL[r.variant]} · {formatValue(variantValue(r.item, r.variant))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => setQty(r.key, -1)} className="rounded-md border border-border p-1" aria-label="Kurangi">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-xs font-black">{r.qty}</span>
                <button onClick={() => setQty(r.key, 1)} className="rounded-md border border-border p-1" aria-label="Tambah">
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setRows((rws) => rws.filter((x) => x.key !== r.key))}
                  className="rounded-md p-1 text-red-400 hover:bg-red-500/10"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 rounded-2xl bg-muted/40 px-3 py-2 text-center text-xs font-black">
        Total Value: {formatValue(total)}
      </p>
    </div>
  );
}

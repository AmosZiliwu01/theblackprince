import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { TradeNav } from "@/components/trade/trade-nav";
import { ItemPicker } from "@/components/trade/item-picker";
import { TradeAccess } from "@/components/trade/trade-access";
import { Button } from "@/components/ui/button";
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
  const [waNumber, setWaNumber] = useState("");

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
    const contactNumber = waNumber.replace(/\D/g, "");
    if (waNumber && !/^\+?[1-9][0-9]{7,14}$/.test(waNumber.trim())) return toast.error("Periksa nomor WhatsApp, gunakan format +628…");

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
      if (contactNumber) {
        const { error: contactError } = await sb.from("trade_offer_contacts").insert({ offer_id: offer.id, owner_id: user.id, whatsapp_number: `+${contactNumber}` });
        if (contactError) throw contactError;
      }

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
          <TradeAccess onClose={() => navigate({ to: "/trade" })} onSuccess={() => window.location.reload()} />
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

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <SideEditor title="Saya Memberi" rows={give} setRows={setGive} onAdd={() => setPicker("offer")} total={sum(give)} />
          <SideEditor title="Saya Mencari" rows={want} setRows={setWant} onAdd={() => setPicker("request")} total={sum(want)} />
        </div>

        <label className="mt-4 block text-sm font-semibold" htmlFor="trade-wa">WhatsApp kamu <span className="font-normal text-muted-foreground">(opsional, tidak ditampilkan ke publik)</span></label>
        <input id="trade-wa" type="tel" inputMode="tel" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="+628…" className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm" />
        <Button
          onClick={submit}
          disabled={saving}
          className="mt-4 w-full"
        >
          {saving ? "Menyimpan…" : "Posting Penawaran"}
        </Button>
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
    <div className="min-w-0 rounded-md border border-border bg-card p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black sm:text-base">{title}</p>
        <Button
          onClick={onAdd}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" /> Item
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          Belum ada item.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {rows.map((r) => (
            <div key={r.key} className="min-w-0 rounded-md border border-border bg-background p-1.5 text-center">
              <img
                src={r.item.image_url ?? ""}
                alt={r.item.name}
                loading="lazy"
                className="mx-auto h-10 w-10 rounded-md bg-muted object-contain sm:h-12 sm:w-12"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{r.item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {VARIANT_LABEL[r.variant]} · {formatValue(variantValue(r.item, r.variant))}
                </p>
              </div>
              <div className="mt-1 flex items-center justify-center gap-0.5">
                <Button variant="ghost" size="icon" onClick={() => setQty(r.key, -1)} className="h-6 w-6" aria-label="Kurangi">
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-4 text-center text-xs font-black">{r.qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(r.key, 1)} className="h-6 w-6" aria-label="Tambah">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon"
                  onClick={() => setRows((rws) => rws.filter((x) => x.key !== r.key))}
                  className="h-6 w-6 text-destructive"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 bg-muted/40 px-2 py-2 text-center text-xs font-black">
        Total Value: {formatValue(total)}
      </p>
    </div>
  );
}

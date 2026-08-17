import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { categoryEntry, parseCategoryEntry } from "@/lib/discount";

const sb = supabase as any;

export const Route = createFileRoute("/_authenticated/admin/promotions")({
  component: PromotionsAdmin,
});

type Scope = "all" | "category" | "products";
type Kind = "fruit" | "joki" | "account";

const KINDS: { value: Kind; label: string }[] = [
  { value: "fruit", label: "Buah" },
  { value: "joki", label: "Joki" },
  { value: "account", label: "Akun" },
];

const EMPTY = {
  title: "",
  subtitle: "",
  discount_percent: 10,
  scope: "all" as Scope,
  target_kinds: ["fruit"] as Kind[],
  target_categories: [] as string[],
  target_product_ids: [] as string[],
  image_url: "",
  active: true,
  starts_at: "",
  ends_at: "",
  sort_order: 0,
};

const TABLE: Record<Kind, string> = { fruit: "fruits", joki: "joki_services", account: "accounts" };
const CAT_FIELD: Record<Kind, string> = { fruit: "category", joki: "category", account: "status" };
const kindLabel = (k: string) => KINDS.find((x) => x.value === k)?.label ?? k;

function PromotionsAdmin() {
  const qc = useQueryClient();
  const queryKey = ["admin", "promotions"];

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await sb.from("promotions").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const [form, setForm] = useState<any | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey });
    qc.invalidateQueries({ queryKey: ["public"] });
  };

  const save = useMutation({
    mutationFn: async (v: any) => {
      const kinds: Kind[] = v.scope === "all" ? [] : (v.target_kinds ?? []);
      const payload = {
        title: v.title,
        subtitle: v.subtitle || null,
        discount_percent: Number(v.discount_percent),
        scope: v.scope,
        target_kinds: kinds,
        // kolom lama tetap diisi agar promo lama/kode lama tidak rusak
        target_kind: kinds[0] ?? null,
        target_categories:
          v.scope === "category"
            ? (v.target_categories ?? []).filter((c: string) => kinds.includes(parseCategoryEntry(c).kind as Kind))
            : [],
        target_product_ids: v.scope === "products" ? v.target_product_ids : [],
        image_url: v.image_url || null,
        active: !!v.active,
        starts_at: v.starts_at ? new Date(v.starts_at).toISOString() : null,
        ends_at: v.ends_at ? new Date(v.ends_at).toISOString() : null,
        sort_order: Number(v.sort_order) || 0,
      };
      const { error } = v.id
        ? await sb.from("promotions").update(payload).eq("id", v.id)
        : await sb.from("promotions").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Promo tersimpan");
      setForm(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal simpan"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Promo dihapus");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal hapus"),
  });

  const openEdit = (r: any) => {
    const kinds: Kind[] =
      (r.target_kinds ?? []).length > 0 ? (r.target_kinds as Kind[]) : r.target_kind ? [r.target_kind as Kind] : ["fruit"];
    // promo lama menyimpan kategori tanpa prefix jenis → migrasikan di UI
    const cats: string[] = (r.target_categories ?? []).map((c: string) => {
      const p = parseCategoryEntry(c);
      return p.kind ? c : categoryEntry(kinds[0] ?? "fruit", p.category);
    });
    setForm({
      ...EMPTY,
      ...r,
      subtitle: r.subtitle ?? "",
      image_url: r.image_url ?? "",
      target_kinds: kinds,
      target_categories: cats,
      target_product_ids: r.target_product_ids ?? [],
      starts_at: r.starts_at ? String(r.starts_at).slice(0, 16) : "",
      ends_at: r.ends_at ? String(r.ends_at).slice(0, 16) : "",
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Promo &amp; Diskon</h1>
          <p className="text-sm text-muted-foreground">
            Diskon persen untuk semua produk, per jenis/kategori, atau produk tertentu. Diskon terbesar yang berlaku dipakai.
          </p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY })}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl gradient-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-neon"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Belum ada promo.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const kinds: string[] = (r.target_kinds ?? []).length ? r.target_kinds : r.target_kind ? [r.target_kind] : [];
            const cats: string[] = (r.target_categories ?? []).map((c: string) => parseCategoryEntry(c).category);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {r.title}{" "}
                    <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                      -{Number(r.discount_percent)}%
                    </span>
                    {!r.active && <span className="ml-2 text-[10px] text-muted-foreground">(nonaktif)</span>}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.scope === "all"
                      ? "Semua produk"
                      : r.scope === "category"
                        ? `${kinds.map(kindLabel).join(" + ") || "—"} · ${cats.length ? cats.join(", ") : "semua kategori"}`
                        : `${(r.target_product_ids ?? []).length} produk (${kinds.map(kindLabel).join(" + ")})`}
                  </p>
                </div>
                <button onClick={() => openEdit(r)} className="rounded-lg border border-border p-2 hover:bg-accent" aria-label="Edit">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus promo "${r.title}"?`)) del.mutate(r.id);
                  }}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <PromoForm value={form} onChange={setForm} onClose={() => setForm(null)} onSave={() => save.mutate(form)} saving={save.isPending} />
      )}
    </div>
  );
}

function PromoForm({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: any;
  onChange: (v: any) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  const kinds: Kind[] = value.target_kinds ?? [];

  const { data: productsByKind = {} } = useQuery({
    queryKey: ["admin", "promo-products", [...kinds].sort().join(",")],
    queryFn: async () => {
      const out: Record<string, any[]> = {};
      for (const k of kinds) {
        const { data, error } = await sb.from(TABLE[k]).select("*").order("name");
        if (error) throw error;
        out[k] = (data as any[]) ?? [];
      }
      return out;
    },
    enabled: kinds.length > 0,
  });

  const catGroups = useMemo(
    () =>
      kinds.map((k) => ({
        kind: k,
        items: Array.from(new Set(((productsByKind as any)[k] ?? []).map((p: any) => p[CAT_FIELD[k]]).filter(Boolean))) as string[],
      })),
    [kinds, productsByKind],
  );

  const toggleKind = (k: Kind) => {
    const next = kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k];
    onChange({
      ...value,
      target_kinds: next,
      // buang kategori/produk dari jenis yang tidak lagi dipilih
      target_categories: (value.target_categories ?? []).filter((c: string) => next.includes(parseCategoryEntry(c).kind as Kind)),
      target_product_ids: value.target_product_ids ?? [],
    });
  };

  const toggleCat = (entry: string) => {
    const cur: string[] = value.target_categories ?? [];
    set("target_categories", cur.includes(entry) ? cur.filter((x) => x !== entry) : [...cur, entry]);
  };

  const setGroup = (k: Kind, items: string[], on: boolean) => {
    const entries = items.map((c) => categoryEntry(k, c));
    const cur: string[] = value.target_categories ?? [];
    set(
      "target_categories",
      on ? Array.from(new Set([...cur, ...entries])) : cur.filter((c) => !entries.includes(c)),
    );
  };

  const toggleProduct = (id: string) => {
    const cur: string[] = value.target_product_ids ?? [];
    set("target_product_ids", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  const selectedCats = (value.target_categories ?? []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-black">{value.id ? "Edit Promo" : "Promo Baru"}</p>
          <button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Judul Promo *">
            <input className={inp} value={value.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Subjudul">
            <input className={inp} value={value.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Diskon (%) *">
              <input
                type="number"
                min={1}
                max={100}
                className={inp}
                value={value.discount_percent}
                onChange={(e) => set("discount_percent", e.target.value)}
              />
            </Field>
            <Field label="Urutan">
              <input type="number" className={inp} value={value.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
            </Field>
          </div>

          <Field label="Berlaku untuk">
            <select className={inp} value={value.scope} onChange={(e) => set("scope", e.target.value)}>
              <option value="all">Semua produk</option>
              <option value="category">Jenis / kategori tertentu</option>
              <option value="products">Produk tertentu</option>
            </select>
          </Field>

          {value.scope !== "all" && (
            <Field label={`Jenis produk (bisa lebih dari satu) — ${kinds.length} jenis dipilih`}>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {KINDS.map((k) => {
                  const on = kinds.includes(k.value);
                  return (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() => toggleKind(k.value)}
                      className={
                        "rounded-full border px-3 py-1 text-xs font-bold " +
                        (on ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground")
                      }
                    >
                      {on ? "☑" : "☐"} {k.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          {value.scope === "category" && (
            <Field label={`Kategori — ${selectedCats} kategori dipilih (kosongkan = semua kategori pada jenis terpilih)`}>
              <div className="mt-1 space-y-3">
                {kinds.length === 0 && <span className="text-xs text-muted-foreground">Pilih jenis produk dulu.</span>}
                {catGroups.map((g) => (
                  <div key={g.kind} className="rounded-xl border border-border p-2">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-black">{kindLabel(g.kind)}</span>
                      <span className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setGroup(g.kind, g.items, true)}
                          className="rounded-md border border-border px-2 py-0.5 text-[10px] font-bold hover:bg-accent"
                        >
                          Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setGroup(g.kind, g.items, false)}
                          className="rounded-md border border-border px-2 py-0.5 text-[10px] font-bold hover:bg-accent"
                        >
                          Hapus Semua
                        </button>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.length === 0 && <span className="text-xs text-muted-foreground">Belum ada kategori.</span>}
                      {g.items.map((c) => {
                        const entry = categoryEntry(g.kind, c);
                        const on = (value.target_categories ?? []).includes(entry);
                        return (
                          <button
                            key={entry}
                            type="button"
                            onClick={() => toggleCat(entry)}
                            className={
                              "rounded-full border px-2.5 py-1 text-xs font-bold " +
                              (on ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground")
                            }
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          )}

          {value.scope === "products" && (
            <Field label="Pilih produk">
              <div className="mt-1 max-h-52 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
                {kinds.length === 0 && <span className="text-xs text-muted-foreground">Pilih jenis produk dulu.</span>}
                {kinds.map((k) => (
                  <div key={k}>
                    <p className="mb-1 text-[11px] font-black text-muted-foreground">{kindLabel(k)}</p>
                    {((productsByKind as any)[k] ?? []).map((p: any) => (
                      <label key={p.id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={(value.target_product_ids ?? []).includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mulai">
              <input type="datetime-local" className={inp} value={value.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
            </Field>
            <Field label="Berakhir">
              <input type="datetime-local" className={inp} value={value.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
            </Field>
          </div>

          <Field label="Gambar Banner Promo">
            <ImageUploadField value={value.image_url} onChange={(v: any) => set("image_url", v)} />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!value.active} onChange={(e) => set("active", e.target.checked)} />
            Aktif
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent">
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving || !value.title || (value.scope !== "all" && kinds.length === 0)}
            className="inline-flex items-center gap-1 rounded-xl gradient-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-neon disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

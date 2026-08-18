import { createServerFn } from "@tanstack/react-start";

/**
 * Sumber data trade value komunitas (pihak ketiga), bukan nilai resmi Blox Fruits.
 * Endpoint sudah diverifikasi: JSON array, tanpa API key.
 */
const SOURCE_URL = "https://bloxvalues.net/wp-json/bloxcalc/v1/items";
const SOURCE_NAME = "bloxvalues.net";
/** Cache minimal 6 jam supaya API sumber tidak dihujani request. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const slugify = (s: string) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type SourceItem = {
  name?: string;
  image?: string;
  value_reg?: number;
  value_perm?: number;
  rarity?: string;
  type?: string;
  trend?: string;
  demand?: string;
  category?: string;
  beli_price?: number;
  last_updated?: number;
};

/** Satu baris per item sumber. Regular & Permanent = varian dari item yang sama. */
function toRows(items: SourceItem[]) {
  const rows: any[] = [];
  const seen = new Set<string>();

  for (const it of items) {
    const name = String(it.name ?? "").trim();
    if (!name) continue;

    const cat = String(it.category ?? "").toLowerCase();
    const kind = cat.startsWith("gamepass") ? "gamepass" : cat.startsWith("limited") ? "limited" : "fruit";

    const slug = slugify(name);
    const key = `${slug}|${kind}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const reg = Number(it.value_reg ?? 0) || null;
    const perm = Number(it.value_perm ?? 0) || null;

    rows.push({
      name,
      slug,
      type: kind,
      category: it.category ?? null,
      rarity: it.rarity ?? null,
      image_url: it.image ?? null,
      regular_value: kind === "fruit" ? reg : kind === "limited" ? reg : null,
      permanent_value: kind === "fruit" ? perm : null,
      gamepass_value: kind === "gamepass" ? reg : null,
      price: Number(it.beli_price ?? 0) || null,
      demand: it.demand ?? null,
      trend: it.trend ?? null,
      source: SOURCE_NAME,
      source_updated_at: it.last_updated ? new Date(Number(it.last_updated) * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  }
  return rows;
}

/**
 * Ambil data terbaru dari sumber lalu simpan ke cache Supabase (trade_items).
 * Hanya request ke sumber bila cache sudah kadaluarsa (kecuali force = true).
 */
export const syncTradeItems = createServerFn({ method: "POST" })
  .inputValidator((data: { force?: boolean } | undefined) => ({ force: !!data?.force }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sb = supabaseAdmin as any;

    if (!data.force) {
      const { data: latest } = await sb
        .from("trade_items")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1);
      const last = latest?.[0]?.updated_at ? new Date(latest[0].updated_at).getTime() : 0;
      if (last && Date.now() - last < CACHE_TTL_MS) {
        return { synced: 0, skipped: true as const, source: SOURCE_NAME };
      }
    }

    let items: SourceItem[] = [];
    try {
      const res = await fetch(SOURCE_URL, { headers: { accept: "application/json" }, cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      items = Array.isArray(json) ? json : [];
    } catch (e: any) {
      // Sumber sedang bermasalah → tetap pakai cache terakhir.
      return { synced: 0, skipped: true as const, error: String(e?.message ?? e), source: SOURCE_NAME };
    }

    const rows = toRows(items);
    if (!rows.length) return { synced: 0, skipped: true as const, error: "empty source", source: SOURCE_NAME };

    const { error } = await sb.from("trade_items").upsert(rows, { onConflict: "slug,type" });
    if (error) throw new Error(error.message);

    // Bersihkan sisa item lama yang sudah tidak ada di sumber (mis. entri "Perm X" versi lama).
    const keep = rows.map((r) => r.slug);
    const { data: all } = await sb.from("trade_items").select("id,slug,type");
    const stale = (all ?? []).filter(
      (r: any) => !rows.some((x) => x.slug === r.slug && x.type === r.type) && keep.length > 0,
    );
    if (stale.length) await sb.from("trade_items").delete().in("id", stale.map((r: any) => r.id));

    return { synced: rows.length, skipped: false as const, source: SOURCE_NAME };
  });

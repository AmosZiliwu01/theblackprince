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
  last_updated?: number;
};

function toRows(items: SourceItem[]) {
  const rows: any[] = [];
  for (const it of items) {
    const name = String(it.name ?? "").trim();
    if (!name) continue;
    const slug = slugify(name);
    const src_updated = it.last_updated ? new Date(Number(it.last_updated) * 1000).toISOString() : null;
    const isGamepass = String(it.category ?? "").toLowerCase().startsWith("gamepass");
    const base = {
      image_url: it.image ?? null,
      demand: it.demand ?? null,
      trend: it.trend ?? null,
      source: SOURCE_NAME,
      source_updated_at: src_updated,
      updated_at: new Date().toISOString(),
    };

    if (isGamepass) {
      rows.push({ ...base, name, slug, type: "gamepass", gamepass_value: Number(it.value_reg ?? 0) || null });
      continue;
    }

    const reg = Number(it.value_reg ?? 0);
    if (reg > 0) rows.push({ ...base, name, slug, type: "physical", regular_value: reg });

    const perm = Number(it.value_perm ?? 0);
    // Permanent adalah item TERPISAH dari physical fruit.
    if (perm > 0) rows.push({ ...base, name: `Perm ${name}`, slug, type: "permanent", permanent_value: perm });
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

    return { synced: rows.length, skipped: false as const, source: SOURCE_NAME };
  });

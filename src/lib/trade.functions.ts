import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
  last_updated?: number | string;
};

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sourceDate(value: SourceItem["last_updated"]): string | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric)
    : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Satu baris per item sumber. Regular & Permanent = varian dari item yang sama. */
function toRows(items: SourceItem[]) {
  const rows: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  for (const it of items) {
    const name = String(it.name ?? "").trim();
    if (!name) continue;

    const cat = String(it.category ?? "").trim().toLowerCase();
    const kind = cat.includes("gamepass") ? "gamepass" : cat.includes("limited") ? "limited" : "fruit";

    const slug = slugify(name);
    const key = `${slug}|${kind}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const reg = finiteNumber(it.value_reg);
    const perm = finiteNumber(it.value_perm);

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
      price: finiteNumber(it.beli_price),
      demand: it.demand ?? null,
      trend: it.trend ?? null,
      source: SOURCE_NAME,
      source_updated_at: sourceDate(it.last_updated),
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
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { force?: boolean } | undefined) => ({ force: !!data?.force }))
  .handler(async ({ data, context }) => {
    const { data: role, error: roleError } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError || !role) throw new Error("Hanya admin yang dapat menyinkronkan item Trade.");
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
      const res = await fetch(SOURCE_URL, {
        headers: { accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        console.error(`[trade-sync] Source returned HTTP ${res.status}`);
        return { synced: 0, skipped: true as const, error: `Sumber nilai merespons HTTP ${res.status}`, source: SOURCE_NAME };
      }
      const json: unknown = await res.json();
      if (!Array.isArray(json) || json.length === 0) {
        console.error("[trade-sync] Source returned an empty or invalid response");
        return { synced: 0, skipped: true as const, error: "Format data sumber tidak valid atau kosong", source: SOURCE_NAME };
      }
      items = json as SourceItem[];
    } catch (e: any) {
      console.error("[trade-sync] Could not fetch source", e);
      return { synced: 0, skipped: true as const, error: "Sumber nilai sedang tidak bisa dihubungi; data lama tetap dipakai", source: SOURCE_NAME };
    }

    const rows = toRows(items);
    if (!rows.length) return { synced: 0, skipped: true as const, error: "empty source", source: SOURCE_NAME };

    const { error } = await sb.from("trade_items").upsert(rows, { onConflict: "slug,type" });
    if (error) {
      console.error("[trade-sync] Could not save source values", error);
      throw new Error(`Gagal menyimpan nilai terbaru: ${error.message}`);
    }

    // Hapus hanya item lama dari sumber ini, jangan sentuh item dari sumber lain.
    const { data: all, error: selectError } = await sb
      .from("trade_items")
      .select("id,slug,type")
      .eq("source", SOURCE_NAME);
    if (selectError) {
      console.error("[trade-sync] Could not inspect old source rows", selectError);
      throw new Error(`Nilai diperbarui, tetapi pemeriksaan item lama gagal: ${selectError.message}`);
    }
    const stale = (all ?? []).filter(
      (r: { slug: string; type: string }) => !rows.some((x) => x.slug === r.slug && x.type === r.type),
    );
    if (stale.length) {
      const { error: deleteError } = await sb.from("trade_items").delete().in("id", stale.map((r: { id: string }) => r.id));
      if (deleteError) {
        console.error("[trade-sync] Could not remove obsolete source rows", deleteError);
        throw new Error(`Nilai diperbarui, tetapi item lama gagal dibersihkan: ${deleteError.message}`);
      }
    }

    return { synced: rows.length, skipped: false as const, source: SOURCE_NAME };
  });

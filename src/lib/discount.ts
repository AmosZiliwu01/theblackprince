/**
 * Logika promo & diskon TERPUSAT.
 * Semua perhitungan diskon di seluruh app WAJIB lewat file ini.
 */

export type PromoKind = "fruit" | "joki" | "account";

export interface Promotion {
  id: string;
  title: string;
  discount_percent: number;
  scope: "all" | "category" | "products" | string;
  /** Legacy single kind — tetap dibaca untuk promo lama. */
  target_kind?: PromoKind | null;
  /** Multi-select jenis produk. */
  target_kinds?: string[] | null;
  /**
   * Kategori. Format baru: "kind:category" (mis. "fruit:Buddha").
   * Format lama tanpa prefix tetap didukung.
   */
  target_categories?: string[] | null;
  target_product_ids?: string[] | null;
  image_url?: string | null;
  subtitle?: string | null;
  active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  sort_order?: number;
}

export interface PromoTarget {
  id: string;
  kind: PromoKind;
  category?: string | null;
}

/** Promo sedang berlaku (aktif + dalam rentang waktu). */
export function isPromoLive(p: Promotion, now: Date = new Date()): boolean {
  if (!p?.active) return false;
  const t = now.getTime();
  if (p.starts_at && new Date(p.starts_at).getTime() > t) return false;
  if (p.ends_at && new Date(p.ends_at).getTime() < t) return false;
  const pct = Number(p.discount_percent ?? 0);
  return pct > 0 && pct <= 100;
}

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

/** Jenis produk yang dipilih pada promo (multi + fallback legacy). */
export function promoKinds(p: Promotion): string[] {
  const many = (p.target_kinds ?? []).map(norm).filter(Boolean);
  if (many.length) return many;
  return p.target_kind ? [norm(p.target_kind)] : [];
}

/** Pecah entri kategori "kind:category" atau "category". */
export function parseCategoryEntry(entry: string): { kind: string | null; category: string } {
  const raw = String(entry ?? "");
  const i = raw.indexOf(":");
  if (i > 0) {
    const kind = norm(raw.slice(0, i));
    if (kind === "fruit" || kind === "joki" || kind === "account") {
      return { kind, category: norm(raw.slice(i + 1)) };
    }
  }
  return { kind: null, category: norm(raw) };
}

/** Gabungkan jenis + kategori jadi satu entri tersimpan. */
export function categoryEntry(kind: string, category: string): string {
  return `${kind}:${category}`;
}

/**
 * Apakah produk kena promo ini.
 * Logika: OR di dalam kelompok, AND antar kelompok (jenis DAN kategori).
 * Kategori kosong = semua kategori pada jenis yang dipilih.
 */
export function promoApplies(p: Promotion, target: PromoTarget): boolean {
  if (p.scope === "all") return true;
  if (p.scope === "category") {
    const kinds = promoKinds(p);
    if (kinds.length && !kinds.includes(norm(target.kind))) return false;

    const entries = (p.target_categories ?? []).filter(Boolean).map(parseCategoryEntry);
    if (!entries.length) return kinds.length > 0; // semua kategori pada jenis terpilih

    // Kategori relevan untuk jenis produk ini saja.
    const mine = entries.filter((e) => e.kind === null || e.kind === norm(target.kind));
    if (!mine.length) return false;
    return mine.some((e) => e.category === norm(target.category));
  }
  if (p.scope === "products") {
    return (p.target_product_ids ?? []).includes(target.id);
  }
  return false;
}


/** Promo dengan persen terbesar yang berlaku untuk produk ini (atau null). */
export function findBestPromo(
  promos: Promotion[] | undefined | null,
  target: PromoTarget,
  now: Date = new Date(),
): Promotion | null {
  let best: Promotion | null = null;
  for (const p of promos ?? []) {
    if (!isPromoLive(p, now)) continue;
    if (!promoApplies(p, target)) continue;
    if (!best || Number(p.discount_percent) > Number(best.discount_percent)) best = p;
  }
  return best;
}

export function bestDiscountPercent(
  promos: Promotion[] | undefined | null,
  target: PromoTarget,
  now: Date = new Date(),
): number {
  const p = findBestPromo(promos, target, now);
  return p ? Number(p.discount_percent) : 0;
}

/** Potong harga RUPIAH — dibulatkan ke rupiah bulat terdekat. */
export function discountedRp(price: number, percent: number): number {
  const base = Number(price ?? 0);
  if (!percent || percent <= 0) return base;
  return Math.max(0, Math.round(base * (1 - percent / 100)));
}

/** Potong harga RM — dibulatkan ke SEN terdekat (2 desimal), bukan bilangan bulat. */
export function discountedRm(priceRm: number | null | undefined, percent: number): number | null {
  if (priceRm == null || priceRm === 0) return priceRm ?? null;
  const base = Number(priceRm);
  if (!percent || percent <= 0) return base;
  return Math.max(0, Math.round(base * (1 - percent / 100) * 100) / 100);
}

export interface PricedResult {
  percent: number;
  promo: Promotion | null;
  price: number;
  priceRm: number | null;
  originalPrice: number;
  originalPriceRm: number | null;
  discounted: boolean;
}

/** Helper gabungan: harga final Rp + RM untuk sebuah produk. */
export function priceWithPromo(
  promos: Promotion[] | undefined | null,
  target: PromoTarget,
  price: number,
  priceRm?: number | null,
  now: Date = new Date(),
): PricedResult {
  const promo = findBestPromo(promos, target, now);
  const percent = promo ? Number(promo.discount_percent) : 0;
  return {
    percent,
    promo,
    price: discountedRp(price, percent),
    priceRm: discountedRm(priceRm ?? null, percent),
    originalPrice: Number(price ?? 0),
    originalPriceRm: priceRm ?? null,
    discounted: percent > 0,
  };
}

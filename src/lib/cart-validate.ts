import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "./cart-context";

const sb = supabase as any;

export interface StockCheckResult {
  ok: boolean;
  issues: {
    item: CartItem;
    reason: string;
    latestStock: number | null;
    latestPrice: number | null;
    exists: boolean;
    ready: boolean;
  }[];
}

export async function revalidateCart(items: CartItem[]): Promise<StockCheckResult> {
  const issues: StockCheckResult["issues"] = [];
  const byKind: Record<string, CartItem[]> = {};
  for (const it of items) {
    (byKind[it.kind] ??= []).push(it);
  }

  async function loadRows(table: string, ids: string[]) {
    if (!ids.length) return [] as any[];
    const { data, error } = await sb.from(table).select("*").in("id", ids);
    if (error) throw error;
    return data ?? [];
  }

  const fruitRows = await loadRows("fruits", (byKind.fruit ?? []).map((i) => i.id));
  const jokiRows = await loadRows("joki_services", (byKind.joki ?? []).map((i) => i.id));
  const accRows = await loadRows("accounts", (byKind.account ?? []).map((i) => i.id));

  const check = (item: CartItem, row: any, opts: { stockField?: string | null; readyCheck: (r: any) => boolean }) => {
    if (!row) {
      issues.push({ item, reason: "Produk sudah tidak tersedia.", latestStock: 0, latestPrice: null, exists: false, ready: false });
      return;
    }
    const stock = opts.stockField ? (row[opts.stockField] ?? null) : null;
    const ready = opts.readyCheck(row);
    const price = Number(row.price ?? 0);
    if (!ready) {
      issues.push({ item, reason: "Produk sudah tidak aktif / sold out.", latestStock: stock ?? 0, latestPrice: price, exists: true, ready: false });
      return;
    }
    if (stock != null && item.qty > stock) {
      issues.push({ item, reason: `Stok berubah, tersisa ${stock}.`, latestStock: stock, latestPrice: price, exists: true, ready: true });
      return;
    }
    if (price !== Number(item.price)) {
      issues.push({ item, reason: `Harga berubah jadi Rp ${price.toLocaleString("id-ID")}.`, latestStock: stock, latestPrice: price, exists: true, ready: true });
    }
  };

  for (const it of byKind.fruit ?? []) {
    const r = fruitRows.find((x: any) => x.id === it.id);
    check(it, r, { stockField: "stock", readyCheck: (r) => Boolean(r.ready) && Number(r.stock ?? 0) > 0 });
  }
  for (const it of byKind.joki ?? []) {
    const r = jokiRows.find((x: any) => x.id === it.id);
    check(it, r, {
      stockField: "stock",
      readyCheck: (r) => Boolean(r.active) && (r.stock == null || Number(r.stock) > 0),
    });
  }
  for (const it of byKind.account ?? []) {
    const r = accRows.find((x: any) => x.id === it.id);
    check(it, r, {
      stockField: null,
      readyCheck: (r) => r.status === "ready" || r.status === "limited",
    });
  }

  return { ok: issues.length === 0, issues };
}

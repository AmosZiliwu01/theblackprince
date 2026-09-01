import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TradeItem, TradeVariant } from "@/lib/trade";

const sb = supabase as any;

const fresh = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
} as const;

export type OfferStatus = "active" | "closed" | "completed";
export type OfferSide = "offer" | "request";

export interface OfferItemRow {
  id: string;
  offer_id: string;
  side: OfferSide;
  item_id: string | null;
  item_name: string;
  image_url: string | null;
  variant: string;
  qty: number;
  value: number | null;
}

export interface TradeOffer {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  contact: string | null;
  status: OfferStatus;
  offer_value: number;
  request_value: number;
  created_at: string;
  updated_at: string;
  items?: OfferItemRow[];
}

export const STATUS_LABEL: Record<OfferStatus, string> = {
  active: "Open",
  closed: "Closed",
  completed: "Completed",
};

const SELECT = "*, items:trade_offer_items(*)";

export const activeOffersQO = queryOptions({
  ...fresh,
  queryKey: ["trade", "offers", "active"],
  queryFn: async (): Promise<TradeOffer[]> => {
    const { data, error } = await sb
      .from("trade_offers")
      .select(SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as TradeOffer[];
  },
});

export const offerQO = (id: string) =>
  queryOptions({
    ...fresh,
    queryKey: ["trade", "offer", id],
    queryFn: async (): Promise<TradeOffer | null> => {
      const { data, error } = await sb.from("trade_offers").select(SELECT).eq("id", id).maybeSingle();
      if (error) throw error;
      return (data ?? null) as TradeOffer | null;
    },
  });

export const myOffersQO = (userId: string | undefined) =>
  queryOptions({
    ...fresh,
    enabled: !!userId,
    queryKey: ["trade", "offers", "mine", userId ?? "anon"],
    queryFn: async (): Promise<TradeOffer[]> => {
      const { data, error } = await sb
        .from("trade_offers")
        .select(SELECT)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TradeOffer[];
    },
  });

export const notificationsQO = (userId: string | undefined) =>
  queryOptions({
    ...fresh,
    enabled: !!userId,
    queryKey: ["notifications", userId ?? "anon"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        type: string;
        title: string;
        body: string | null;
        link: string | null;
        read: boolean;
        created_at: string;
      }[];
    },
  });

/** Baris draft di form Buat Trade. */
export interface DraftRow {
  key: string;
  item: TradeItem;
  variant: TradeVariant;
  qty: number;
}

export const sumDraft = (rows: DraftRow[], value: (r: DraftRow) => number | null) =>
  rows.reduce((acc, r) => acc + (value(r) ?? 0) * Math.max(1, r.qty), 0);

/** Skor kecocokan sederhana: berapa item yang saya cari ada di penawaran orang lain. */
export function matchScore(mine: TradeOffer, other: TradeOffer): number {
  const want = new Set((mine.items ?? []).filter((i) => i.side === "request").map((i) => i.item_name.toLowerCase()));
  const give = new Set((mine.items ?? []).filter((i) => i.side === "offer").map((i) => i.item_name.toLowerCase()));
  let score = 0;
  for (const it of other.items ?? []) {
    const n = it.item_name.toLowerCase();
    if (it.side === "offer" && want.has(n)) score += 2;
    if (it.side === "request" && give.has(n)) score += 1;
  }
  return score;
}

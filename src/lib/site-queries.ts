import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

// AI & seluruh halaman publik harus selalu memakai data terbaru dari database.
// Tidak ada cache: setiap mount/refocus/reconnect melakukan query ulang.
const fresh = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;

async function selectAll<T = any>(table: string, order = "sort_order"): Promise<T[]> {
  const { data, error } = await sb.from(table).select("*").order(order, { ascending: true });
  if (error) throw error;
  return (data as T[]) ?? [];
}
async function selectAllByCreated<T = any>(table: string): Promise<T[]> {
  const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as T[]) ?? [];
}

export const fruitsQO = queryOptions({ ...fresh, queryKey: ["public", "fruits"], queryFn: () => selectAll("fruits") });
export const jokiQO = queryOptions({ ...fresh, queryKey: ["public", "joki"], queryFn: () => selectAll("joki_services") });
export const accountsQO = queryOptions({ ...fresh, queryKey: ["public", "accounts"], queryFn: () => selectAll("accounts") });
export const communityQO = queryOptions({ ...fresh, queryKey: ["public", "community"], queryFn: () => selectAll("community_links") });
export const liveStatusQO = queryOptions({
  ...fresh,
  queryKey: ["public", "live"],
  queryFn: async () => {
    const { data, error } = await sb.from("live_status").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data as any;
  },
});
export const giveawaysQO = queryOptions({ ...fresh, queryKey: ["public", "giveaways"], queryFn: () => selectAllByCreated("giveaways") });
export const eventsQO = queryOptions({ ...fresh, queryKey: ["public", "events"], queryFn: () => selectAllByCreated("events") });
export const faqsQO = queryOptions({ ...fresh, queryKey: ["public", "faqs"], queryFn: () => selectAll("faqs") });
export const bannersQO = queryOptions({ ...fresh, queryKey: ["public", "banners"], queryFn: () => selectAll("banners") });
export const announcementsQO = queryOptions({ ...fresh, queryKey: ["public", "announcements"], queryFn: () => selectAllByCreated("announcements") });
export const websiteSettingsQO = queryOptions({
  ...fresh,
  queryKey: ["public", "website_settings"],
  queryFn: async () => {
    const { data, error } = await sb.from("website_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data as any;
  },
});
export const aiSettingsQO = queryOptions({
  ...fresh,
  queryKey: ["public", "ai_settings"],
  queryFn: async () => {
    const { data, error } = await sb.from("ai_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data as any;
  },
});
export const categoriesQO = queryOptions({ ...fresh, queryKey: ["public", "categories"], queryFn: () => selectAll("fruit_categories") });

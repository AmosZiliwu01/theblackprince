import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type NotifyInput = {
  /** Penerima notifikasi. */
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
};

/**
 * Notifikasi hanya boleh dibuat server-side (RLS menolak INSERT dari client),
 * dan hanya oleh user yang sudah login. Duplikat dalam 1 menit diabaikan.
 */
export const notifyUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: NotifyInput) => {
    if (!input?.userId || !input?.title || !input?.type) throw new Error("Invalid notification payload");
    return input;
  })
  .handler(async ({ data, context }) => {
    // Jangan kirim notifikasi ke diri sendiri.
    if (data.userId === context.userId) return { ok: true, skipped: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 60_000).toISOString();
    const { data: dupe } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("user_id", data.userId)
      .eq("type", data.type)
      .eq("title", data.title)
      .gte("created_at", since)
      .limit(1);

    if (dupe && dupe.length > 0) return { ok: true, skipped: true };

    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      body: data.body ?? null,
      link: data.link ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true, skipped: false };
  });

/**
 * Tautan WhatsApp pemilik penawaran.
 * Nomornya disimpan tersembunyi (hanya pemilik yang bisa membacanya lewat RLS),
 * jadi diambil server-side dan dikirim hanya ke pembeli yang sudah login.
 * Nomornya tidak pernah tampil di halaman — langsung terbuka di WhatsApp.
 */
export const getTradeWhatsAppLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { offerId?: string } | undefined) => {
    const offerId = String(input?.offerId ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(offerId)) {
      throw new Error("Penawaran tidak valid");
    }
    return { offerId };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sb = supabaseAdmin as any;

    const { data: offer, error: offerError } = await sb
      .from("trade_offers")
      .select("id,user_id,status,title")
      .eq("id", data.offerId)
      .maybeSingle();
    if (offerError) throw new Error(offerError.message);
    if (!offer) throw new Error("Penawaran tidak ditemukan");
    if (offer.status !== "active") throw new Error("Penawaran ini sudah tidak aktif");
    if (offer.user_id === context.userId) throw new Error("Ini penawaran kamu sendiri");

    const { data: contact, error: contactError } = await sb
      .from("trade_offer_contacts")
      .select("whatsapp_number")
      .eq("offer_id", data.offerId)
      .maybeSingle();
    if (contactError) throw new Error(contactError.message);

    const digits = String(contact?.whatsapp_number ?? "").replace(/\D/g, "");
    if (digits.length < 8) return { link: null as string | null };

    const text = `Halo, saya tertarik dengan trade "${offer.title}" di The Black Prince.`;
    return { link: `https://wa.me/${digits}?text=${encodeURIComponent(text)}` };
  });

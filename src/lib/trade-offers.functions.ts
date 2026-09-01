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

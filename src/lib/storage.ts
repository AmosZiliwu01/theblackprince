import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
// 10-year signed URL — bucket is private (public buckets are disabled at workspace level).
const LONG_TTL = 60 * 60 * 24 * 365 * 10;

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, LONG_TTL);
  if (signErr) throw signErr;
  return data.signedUrl;
}

export async function deleteProductImageByUrl(url: string) {
  try {
    const marker = `/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    let path = url.slice(idx + marker.length);
    path = path.split("?")[0];
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (e) {
    console.warn("delete image failed", e);
  }
}

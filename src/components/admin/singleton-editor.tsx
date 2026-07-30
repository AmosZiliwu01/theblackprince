import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { FieldDef } from "./admin-crud";

const sb = supabase as any;

export function SingletonEditor({
  table,
  title,
  description,
  fields,
}: {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}) {
  const [row, setRow] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      const { data } = await sb.from(table).select("*").eq("id", 1).maybeSingle();
      setRow(data ?? { id: 1 });
    })();
  }, [table]);

  async function save() {
    setSaving(true);
    try {
      const payload: any = { id: 1 };
      for (const f of fields) {
        let v = row?.[f.key];
        if (f.type === "number") {
          v = v === "" || v == null ? null : Number(v);
        } else if (f.type === "boolean") {
          v = Boolean(v);
        } else if (typeof v === "string") {
          // Keep empty strings as "" rather than null — several singleton
          // columns (ai_settings.forbidden_words, custom_instructions, etc.)
          // are defined NOT NULL DEFAULT '' and reject null values.
          v = v;
        } else if (v == null) {
          v = f.type === "text" || f.type === "textarea" ? "" : null;
        }
        payload[f.key] = v;
      }
      const { error } = await sb.from(table).upsert(payload, { onConflict: "id" });
      if (error) throw error;
      // Buang seluruh cache data publik agar situs & AI langsung memakai data baru.
      await qc.invalidateQueries({ queryKey: ["public"] });
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Disimpan");
    } catch (err: any) {
      console.error("SingletonEditor save failed:", err);
      toast.error(err?.message ?? "Gagal simpan");
    } finally {
      setSaving(false);
    }
  }

  if (!row) {
    return (
      <div className="grid place-items-center p-10 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-muted-foreground">
              {f.label}
              {f.required && <span className="ml-1 text-red-400">*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                value={row[f.key] ?? ""}
                onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
                rows={5}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            ) : f.type === "boolean" ? (
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(row[f.key])}
                  onChange={(e) => setRow({ ...row, [f.key]: e.target.checked })}
                  className="h-4 w-4 accent-[oklch(0.72_0.20_45)]"
                />
                <span className="text-sm">{row[f.key] ? "Aktif" : "Nonaktif"}</span>
              </label>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                value={row[f.key] ?? ""}
                onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-neon disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "./image-upload-field";

const sb = supabase as any;

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "datetime" | "image";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  colSpan?: 1 | 2;
  placeholder?: string;
  hidden?: boolean;
}

export interface AdminCrudProps {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  listColumns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  orderBy?: string;
  orderAsc?: boolean;
}

export function AdminCrud({
  table,
  title,
  description,
  fields,
  listColumns,
  orderBy = "sort_order",
  orderAsc = true,
}: AdminCrudProps) {
  const qc = useQueryClient();
  const queryKey = ["admin", table];

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await sb.from(table).select("*").order(orderBy, { ascending: orderAsc });
      if (error) throw error;
      return data as any[];
    },
  });

  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey });
    qc.invalidateQueries({ queryKey: ["public"] });
  };

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dihapus");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal hapus"),
  });

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-neon"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="grid place-items-center p-10 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {listColumns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={listColumns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada data.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-accent/30">
                  {listColumns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-2.5">
                      {c.render ? c.render(r) : formatCell(r[c.key])}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(r)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Hapus data ini?")) del.mutate(r.id);
                        }}
                        className="rounded-md p-1.5 text-red-400 hover:bg-red-500/20"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <RecordModal
          table={table}
          fields={fields}
          record={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}

function formatCell(v: any) {
  if (v == null) return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return v ? "✓" : "—";
  if (typeof v === "number") {
    if (v > 999) return v.toLocaleString("id-ID");
    return v;
  }
  if (typeof v === "string" && v.length > 60) return v.slice(0, 60) + "…";
  return String(v);
}

function RecordModal({
  table,
  fields,
  record,
  onClose,
  onSaved,
}: {
  table: string;
  fields: FieldDef[];
  record: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!record;
  const [values, setValues] = useState<any>(() => {
    if (record) return { ...record };
    const init: any = {};
    for (const f of fields) init[f.key] = f.defaultValue ?? (f.type === "boolean" ? false : "");
    return init;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {};
      for (const f of fields) {
        let v = values[f.key];
        if (f.type === "number") v = v === "" || v == null ? null : Number(v);
        if (f.type === "datetime") v = v ? new Date(v).toISOString() : null;
        if (f.type === "boolean") v = Boolean(v);
        if (typeof v === "string" && v.trim() === "" && !f.required) v = null;
        payload[f.key] = v;
      }
      if (isEdit) {
        const { error } = await sb.from(table).update(payload).eq("id", record.id);
        if (error) throw error;
        toast.success("Disimpan");
      } else {
        const { error } = await sb.from(table).insert(payload);
        if (error) throw error;
        toast.success("Ditambahkan");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Gagal simpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">{isEdit ? "Edit" : "Tambah"} data</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fields.filter((f) => !f.hidden).map((f) => (
            <div key={f.key} className={f.colSpan === 2 || f.type === "textarea" || f.type === "image" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
              <label className="block text-xs font-semibold text-muted-foreground">
                {f.label}
                {f.required && <span className="ml-1 text-red-400">*</span>}
              </label>
              <FieldInput field={f} value={values[f.key]} onChange={(v) => setValues({ ...values, [f.key]: v })} />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-neon disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const base = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60";
  if (field.type === "textarea") {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={field.placeholder}
        required={field.required}
        className={base + " min-h-[80px]"}
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <label className="mt-2 inline-flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[oklch(0.72_0.20_45)]"
        />
        <span className="text-sm text-muted-foreground">{value ? "Aktif" : "Nonaktif"}</span>
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className={base}
      >
        <option value="">— pilih —</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "datetime") {
    const dtVal =
      value && typeof value === "string"
        ? new Date(value).toISOString().slice(0, 16)
        : "";
    return (
      <input
        type="datetime-local"
        value={dtVal}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(field.type === "number" ? e.target.value : e.target.value)}
      required={field.required}
      placeholder={field.placeholder}
      className={base}
    />
  );
}

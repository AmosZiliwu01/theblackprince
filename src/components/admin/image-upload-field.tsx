import { useRef, useState } from "react";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadProductImage } from "@/lib/storage";
import { toast } from "sonner";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUploadField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("File bukan gambar.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran maks 5MB.");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadProductImage(f);
      onChange(url);
      toast.success("Gambar diupload");
    } catch (e: any) {
      toast.error(e.message || "Gagal upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-1 flex items-center gap-3 rounded-xl border border-dashed border-border bg-background/50 p-2">
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
        {value ? (
          <img src={value} alt="preview" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold hover:bg-accent disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {value ? "Ganti" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            >
              <X className="h-3.5 w-3.5" /> Hapus
            </button>
          )}
        </div>
        {value && <p className="truncate text-[10px] text-muted-foreground">Tersimpan</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
}

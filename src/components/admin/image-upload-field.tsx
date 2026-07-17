import { useRef, useState } from "react";
import { Loader2, Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { uploadProductImage } from "@/lib/storage";
import { toast } from "sonner";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUploadField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlDraft, setUrlDraft] = useState(value ?? "");

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
      setUrlDraft(url);
      toast.success("Gambar diupload");
    } catch (e: any) {
      toast.error(e.message || "Gagal upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function applyUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      toast.error("URL tidak valid.");
      return;
    }
    onChange(trimmed);
    toast.success("URL gambar disetel");
  }

  return (
    <div className="mt-1 space-y-2 rounded-xl border border-dashed border-border bg-background/50 p-2">
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
          {value ? (
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-1 gap-1 rounded-lg bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={
              "flex-1 rounded-md px-2 py-1.5 font-semibold transition " +
              (mode === "upload" ? "bg-background text-foreground shadow" : "text-muted-foreground")
            }
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={
              "flex-1 rounded-md px-2 py-1.5 font-semibold transition " +
              (mode === "url" ? "bg-background text-foreground shadow" : "text-muted-foreground")
            }
          >
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold hover:bg-accent disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {value ? "Ganti" : "Upload"} File
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setUrlDraft("");
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            >
              <X className="h-3.5 w-3.5" /> Hapus
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </div>
      ) : (
        <div className="flex gap-1">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://example.com/gambar.jpg"
              className="w-full rounded-md border border-border bg-card py-1.5 pl-7 pr-2 text-xs outline-none focus:border-primary/60"
            />
          </div>
          <button
            type="button"
            onClick={applyUrl}
            className="shrink-0 rounded-md border border-primary/50 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            Terapkan
          </button>
        </div>
      )}

      {value && <p className="truncate text-[10px] text-muted-foreground">{value}</p>}
    </div>
  );
}
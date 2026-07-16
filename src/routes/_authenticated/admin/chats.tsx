import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

export const Route = createFileRoute("/_authenticated/admin/chats")({
  component: ChatsPage,
});

function truncate(text: string, max = 48) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

function ChatsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const sessions = useQuery({
    queryKey: ["admin", "chat_sessions"],
    queryFn: async () => {
      const { data, error } = await sb.from("chat_sessions").select("*").order("updated_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as any[];
    },
  }).data ?? [];

  // First user message per session, used as a human-readable title in the list.
  const previews = useQuery({
    queryKey: ["admin", "chat_previews", sessions.map((s: any) => s.session_key).join(",")],
    enabled: sessions.length > 0,
    queryFn: async () => {
      const keys = sessions.map((s: any) => s.session_key);
      const { data, error } = await sb
        .from("chat_messages")
        .select("session_key,content,role,created_at")
        .in("session_key", keys)
        .eq("role", "user")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const m of data ?? []) {
        if (!map[m.session_key]) map[m.session_key] = m.content;
      }
      return map;
    },
  }).data ?? {};

  const messages = useQuery({
    queryKey: ["admin", "chat_messages", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await sb
        .from("chat_messages")
        .select("*")
        .eq("session_key", selected)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  }).data ?? [];

  const del = useMutation({
    mutationFn: async (key: string) => {
      await sb.from("chat_messages").delete().eq("session_key", key);
      await sb.from("chat_sessions").delete().eq("session_key", key);
    },
    onSuccess: () => {
      toast.success("Sesi dihapus");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin", "chat_sessions"] });
    },
  });

  const filtered = sessions.filter((s: any) => {
    if (!q) return true;
    const preview = previews[s.session_key] ?? "";
    return s.session_key.includes(q) || preview.toLowerCase().includes(q.toLowerCase());
  });

  function exportJson() {
    const data = { session: selected, messages };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${selected}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectedPreview = selected ? previews[selected] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari session atau isi pesan..."
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">Belum ada sesi chat.</p>
          )}
          {filtered.map((s: any) => {
            const preview = previews[s.session_key];
            return (
              <button
                key={s.session_key}
                onClick={() => setSelected(s.session_key)}
                className={
                  "block w-full rounded-lg border p-2 text-left text-xs transition " +
                  (selected === s.session_key
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background/40 hover:border-primary/40")
                }
              >
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {preview ? truncate(preview) : <span className="italic text-muted-foreground">Belum ada pesan</span>}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{s.session_key}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(s.updated_at).toLocaleString("id-ID")}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        {!selected ? (
          <div className="grid h-full min-h-[300px] place-items-center text-sm text-muted-foreground">
            Pilih sesi chat untuk melihat riwayat.
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {selectedPreview ? truncate(selectedPreview, 64) : "Sesi Chat"}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{selected}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={exportJson}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
                >
                  Export
                </button>
                <button
                  onClick={() => confirm("Hapus sesi?") && del.mutate(selected)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-400"
                >
                  {del.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Hapus
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto">
              {messages.map((m: any) => (
                <div
                  key={m.id}
                  className={
                    "flex " + (m.role === "user" ? "justify-end" : "justify-start")
                  }
                >
                  <div
                    className={
                      "max-w-[80%] rounded-xl px-3 py-2 text-sm " +
                      (m.role === "user"
                        ? "gradient-primary text-primary-foreground"
                        : "border border-border bg-background")
                    }
                  >
                    <p className="mb-1 text-[10px] uppercase opacity-70">
                      {m.role} · {new Date(m.created_at).toLocaleString("id-ID")}
                    </p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
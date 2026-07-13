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

  const filtered = sessions.filter((s: any) => !q || s.session_key.includes(q));

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

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari session..."
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">Belum ada sesi chat.</p>
          )}
          {filtered.map((s: any) => (
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
              <p className="truncate font-mono text-[11px]">{s.session_key}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(s.updated_at).toLocaleString("id-ID")}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3">
        {!selected ? (
          <div className="grid h-full min-h-[300px] place-items-center text-sm text-muted-foreground">
            Pilih sesi chat untuk melihat riwayat.
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <p className="truncate font-mono text-xs">{selected}</p>
              <div className="flex gap-2">
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

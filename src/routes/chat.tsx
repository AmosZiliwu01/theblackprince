import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bot, User, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/site-layout";
import { chatWithAssistant } from "@/lib/ai-chat.functions";
import { aiSettingsQO, liveStatusQO } from "@/lib/site-queries";

type Message = { role: "user" | "assistant"; content: string; ts: number };

const SESSION_KEY_STORAGE = "tbp_chat_session";
const HISTORY_STORAGE = "tbp_chat_history";

function makeKey() {
  return "sess_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat AI Admin — The Black Prince" },
      { name: "description", content: "Chat langsung dengan Assistant Admin AI The Black Prince — tanya harga, stok, PS, giveaway, live." },
      { property: "og:title", content: "AI Admin The Black Prince" },
      { property: "og:description", content: "Chat AI 24/7 seputar Blox Fruits." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(aiSettingsQO);
    context.queryClient.ensureQueryData(liveStatusQO);
  },
  component: ChatPage,
});

const QUICK_PROMPTS = [
  "Bang harga dough berapa?",
  "Kitsune ready ga?",
  "PS mana bang?",
  "Link grup dong",
  "Lagi live ga bang?",
  "Ada giveaway?",
  "Cara joki gimana?",
  "Cara awaken buah?",
];

function ChatPage() {
  const settings = useQuery(aiSettingsQO).data as any;
  const live = useQuery(liveStatusQO).data as any;
  const chatFn = useServerFn(chatWithAssistant);

  const [sessionKey] = useState(() => {
    if (typeof window === "undefined") return makeKey();
    const existing = localStorage.getItem(SESSION_KEY_STORAGE);
    if (existing) return existing;
    const k = makeKey();
    localStorage.setItem(SESSION_KEY_STORAGE, k);
    return k;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE, JSON.stringify(messages.slice(-40)));
    } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  const greeting = useMemo(() => {
    return settings?.greeting || "Halo bang! Aku Assistant Admin The Black Prince, ada yang bisa aku bantu?";
  }, [settings]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content, ts: Date.now() }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const historyForApi = newMessages.slice(-16).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatFn({ data: { sessionKey, messages: historyForApi } });
      if (!res.ok) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, ts: Date.now() }]);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal kirim pesan. Coba lagi ya bang.");
    } finally {
      setLoading(false);
      setTimeout(() => taRef.current?.focus(), 50);
    }
  }

  function resetChat() {
    setMessages([]);
    localStorage.removeItem(HISTORY_STORAGE);
    const k = makeKey();
    localStorage.setItem(SESSION_KEY_STORAGE, k);
    window.location.reload();
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-3xl flex-col px-3 py-3 md:h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <span className="relative grid h-11 w-11 place-items-center rounded-xl gradient-primary shadow-neon">
            <Crown className="h-5 w-5 text-primary-foreground" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-black leading-tight">Assistant Admin</p>
            <p className="text-xs text-muted-foreground">
              {live?.is_live ? "🔴 Admin lagi live" : "Online · Membaca database realtime"}
            </p>
          </div>
          <button
            onClick={resetChat}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-card/40 p-3">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md pt-6 text-center">
              <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-neon animate-pulse-neon">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </span>
              <p className="text-sm text-muted-foreground">{greeting}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-xl border border-border bg-background/80 px-3 py-2 text-left text-xs hover:border-primary/60"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "120ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "240ms" }} />
              </span>
              <span>Assistant lagi ngetik...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2"
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={1000}
            placeholder="Ketik pesan... (ex: bg dough ready ga?)"
            className="min-h-[40px] max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-neon disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={"flex gap-2 " + (isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground">
          <Crown className="h-4 w-4" />
        </span>
      )}
      <div
        className={
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed " +
          (isUser
            ? "gradient-primary text-primary-foreground shadow-neon"
            : "border border-border bg-background/80")
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_code]:rounded [&_code]:bg-black/40 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-2 [&_a]:text-primary [&_a]:underline">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          <User className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Lock, MessageCircle, Send, Trash2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { TradeNav } from "@/components/trade/trade-nav";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/use-auth";
import { formatValue, VARIANT_LABEL, type TradeVariant } from "@/lib/trade";
import { notifyUser } from "@/lib/trade-offers.functions";
import {
  STATUS_LABEL,
  activeOffersQO,
  conversationsQO,
  ensureConversation,
  messagesQO,
  offerQO,
  potentialMatches,
  profileQO,
  type OfferItemRow,
  type TradeConversation,
  type TradeOffer,
} from "@/lib/trade-offers";

const sb = supabase as any;

export const Route = createFileRoute("/trade/$id")({
  head: () => ({
    meta: [
      { title: "Detail Penawaran Trade — The Black Prince" },
      {
        name: "description",
        content: "Detail penawaran trade Blox Fruits: item yang ditawarkan, item yang dicari, total value, dan chat dengan pemilik.",
      },
      { property: "og:title", content: "Detail Penawaran Trade — The Black Prince" },
      { property: "og:description", content: "Lihat item, value, dan hubungi pemilik penawaran trade Blox Fruits." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradeDetailPage,
});

function TradeDetailPage() {
  const { id } = Route.useParams();
  const user = useAuthUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: offer, isLoading, error } = useQuery(offerQO(id));
  const { data: ownerProfile } = useQuery(profileQO(offer?.user_id));
  const { data: allOffers = [] } = useQuery(activeOffersQO);

  const isOwner = !!user && !!offer && user.id === offer.user_id;

  const give = (offer?.items ?? []).filter((i) => i.side === "offer");
  const want = (offer?.items ?? []).filter((i) => i.side === "request");
  const giveTotal = sumItems(give);
  const wantTotal = sumItems(want);
  const diff = wantTotal - giveTotal;

  const matches = useMemo(
    () => (offer && isOwner ? potentialMatches(offer, allOffers) : []),
    [offer, isOwner, allOffers],
  );

  async function setStatus(status: "active" | "closed" | "completed") {
    if (!offer) return;
    const { error: e } = await sb.from("trade_offers").update({ status }).eq("id", offer.id);
    if (e) return toast.error(e.message);
    toast.success(`Status diubah ke ${STATUS_LABEL[status]}`);
    qc.invalidateQueries({ queryKey: ["trade"] });
  }

  async function remove() {
    if (!offer || !confirm("Hapus penawaran ini?")) return;
    const { error: e } = await sb.from("trade_offers").delete().eq("id", offer.id);
    if (e) return toast.error(e.message);
    toast.success("Penawaran dihapus");
    qc.invalidateQueries({ queryKey: ["trade"] });
    navigate({ to: "/trade" });
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (error || !offer) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-xl font-black">Penawaran tidak ditemukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Penawaran mungkin sudah dihapus atau ditutup oleh pemiliknya.
          </p>
          <Link to="/trade" className="mt-4 inline-block rounded-2xl gradient-primary px-5 py-2.5 text-sm font-black text-primary-foreground shadow-neon">
            Lihat semua trade
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <TradeNav />

        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="min-w-0 flex-1 text-2xl font-black leading-tight md:text-3xl">{offer.title}</h1>
          <span className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-bold uppercase text-muted-foreground">
            {STATUS_LABEL[offer.status] ?? offer.status}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserCircle2 className="h-4 w-4" />
            {ownerProfile?.display_name?.trim() || "Trader"}
          </span>
          <span>·</span>
          <span>{new Date(offer.created_at).toLocaleString("id-ID")}</span>
        </div>

        {offer.note && (
          <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-border bg-card p-3 text-sm">{offer.note}</p>
        )}
        {offer.contact && (
          <p className="mt-2 rounded-2xl border border-border bg-muted/40 p-3 text-sm">
            <span className="font-bold">Kontak:</span> {offer.contact}
          </p>
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ItemList title="Saya Punya" rows={give} total={giveTotal} />
          <ItemList title="Saya Mencari" rows={want} total={wantTotal} />
        </div>

        <div className="mt-3 rounded-3xl border border-border bg-card p-4 text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Selisih Value</p>
          <p className="text-2xl font-black">
            {diff === 0 ? "Seimbang" : `${diff > 0 ? "+" : "-"}${formatValue(Math.abs(diff))}`}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Dari sudut pandang pemilik penawaran (yang dicari − yang diberikan).
          </p>
        </div>

        {isOwner && (
          <div className="mt-4 rounded-3xl border border-border bg-card p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Kelola Penawaran</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/trade/new"
                search={{ from: offer.id }}
                className="rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-accent"
              >
                Edit (buat ulang)
              </Link>
              {offer.status !== "active" && (
                <button onClick={() => setStatus("active")} className="rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-accent">
                  Buka lagi
                </button>
              )}
              {offer.status !== "closed" && (
                <button onClick={() => setStatus("closed")} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-accent">
                  <Lock className="h-3.5 w-3.5" /> Close
                </button>
              )}
              {offer.status !== "completed" && (
                <button onClick={() => setStatus("completed")} className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                </button>
              )}
              <button onClick={remove} className="inline-flex items-center gap-1 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </div>
        )}

        {isOwner && matches.length > 0 && (
          <div className="mt-4 rounded-3xl border border-border bg-card p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Trade Cocok</p>
            <div className="space-y-2">
              {matches.map((m) => (
                <Link
                  key={m.offer.id}
                  to="/trade/$id"
                  params={{ id: m.offer.id }}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-background p-2 text-sm hover:border-primary/60"
                >
                  <span className="min-w-0 flex-1 truncate font-bold">{m.offer.title}</span>
                  <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary">
                    skor {m.score}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <ChatSection offer={offer} isOwner={isOwner} userId={user?.id} loadingUser={user === undefined} />
      </section>
    </SiteLayout>
  );
}

function sumItems(rows: OfferItemRow[]) {
  return rows.reduce((a, r) => a + Number(r.value ?? 0) * Math.max(1, r.qty), 0);
}

function ItemList({ title, rows, total }: { title: string; rows: OfferItemRow[]; total: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-3">
      <p className="mb-2 font-black">{title}</p>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          Tidak ada item.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
              <img
                src={r.image_url ?? ""}
                alt={r.item_name}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg bg-muted object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{r.item_name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {VARIANT_LABEL[r.variant as TradeVariant] ?? r.variant} · {formatValue(r.value)} · x{r.qty}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 rounded-2xl bg-muted/40 px-3 py-2 text-center text-xs font-black">
        Total Value: {formatValue(total)}
      </p>
    </div>
  );
}

/* --------------------------- Chat --------------------------- */

function ChatSection({
  offer,
  isOwner,
  userId,
  loadingUser,
}: {
  offer: TradeOffer;
  isOwner: boolean;
  userId: string | undefined;
  loadingUser: boolean;
}) {
  const { data: conversations = [], isLoading, refetch } = useQuery(conversationsQO(offer.id, userId));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const mine = useMemo(
    () => (isOwner ? conversations : conversations.filter((c) => c.buyer_id === userId)),
    [conversations, isOwner, userId],
  );

  useEffect(() => {
    if (!activeId && mine.length > 0) setActiveId(mine[0].id);
  }, [mine, activeId]);

  if (loadingUser) return null;

  if (!userId) {
    return (
      <div className="mt-4 rounded-3xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
        <Link to="/auth" className="font-bold text-primary">
          Masuk
        </Link>{" "}
        untuk chat dengan pemilik penawaran ini.
      </div>
    );
  }

  async function startChat() {
    setStarting(true);
    try {
      const conv = await ensureConversation(offer.id, offer.user_id, userId!);
      await refetch();
      setActiveId(conv.id);
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal memulai chat");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mt-4 rounded-3xl border border-border bg-card p-3">
      <p className="mb-2 inline-flex items-center gap-1.5 font-black">
        <MessageCircle className="h-4 w-4 text-primary" /> {isOwner ? "Chat Pembeli" : "Chat Pemilik"}
      </p>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : mine.length === 0 ? (
        isOwner ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Belum ada yang menghubungi penawaran ini.
          </p>
        ) : (
          <button
            onClick={startChat}
            disabled={starting}
            className="w-full rounded-2xl gradient-primary py-3 text-sm font-black text-primary-foreground shadow-neon disabled:opacity-60"
          >
            {starting ? "Membuka chat…" : "Chat Pemilik"}
          </button>
        )
      ) : (
        <>
          {mine.length > 1 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {mine.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={
                    "rounded-full border px-3 py-1 text-[11px] font-bold " +
                    (activeId === c.id ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground")
                  }
                >
                  Chat #{i + 1}
                </button>
              ))}
            </div>
          )}
          {activeId && (
            <ChatBox
              conversation={mine.find((c) => c.id === activeId)!}
              userId={userId}
              offer={offer}
              isOwner={isOwner}
            />
          )}
        </>
      )}
    </div>
  );
}

function ChatBox({
  conversation,
  userId,
  offer,
  isOwner,
}: {
  conversation: TradeConversation;
  userId: string;
  offer: TradeOffer;
  isOwner: boolean;
}) {
  const qc = useQueryClient();
  const { data: messages = [], isLoading, error } = useQuery(messagesQO(conversation.id));
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const notify = useServerFn(notifyUser);
  const boxRef = useRef<HTMLDivElement>(null);

  // Realtime: pesan baru langsung masuk tanpa refresh.
  useEffect(() => {
    const channel = supabase
      .channel(`trade_messages:${conversation.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trade_messages", filter: `conversation_id=eq.${conversation.id}` },
        () => qc.invalidateQueries({ queryKey: ["trade", "messages", conversation.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, qc]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages.length]);

  async function send() {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const { error: e } = await sb
        .from("trade_messages")
        .insert({ conversation_id: conversation.id, sender_id: userId, content: content.slice(0, 1000) });
      if (e) throw e;
      setText("");
      qc.invalidateQueries({ queryKey: ["trade", "messages", conversation.id] });

      const target = isOwner ? conversation.buyer_id : conversation.owner_id;
      notify({
        data: {
          userId: target,
          type: "trade_chat",
          title: `Pesan baru di "${offer.title}"`,
          body: content.slice(0, 120),
          link: `/trade/${offer.id}`,
        },
      }).catch(() => {});
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-background">
      <div ref={boxRef} className="max-h-80 min-h-[8rem] space-y-2 overflow-y-auto p-3">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : error ? (
          <p className="text-xs text-red-300">Gagal memuat pesan.</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">Belum ada pesan. Sapa dulu, bang!</p>
        ) : (
          messages.map((m) => {
            const own = m.sender_id === userId;
            return (
              <div key={m.id} className={"flex " + (own ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
                    (own ? "gradient-primary text-primary-foreground" : "border border-border bg-card")
                  }
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={"mt-1 text-[10px] " + (own ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          maxLength={1000}
          placeholder="Tulis pesan…"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          aria-label="Kirim"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-neon disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

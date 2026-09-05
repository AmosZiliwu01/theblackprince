import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { notificationsQO } from "@/lib/trade-offers";
import { useAuthUser } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifikasi — Update Trade & Chat | The Black Prince" },
      {
        name: "description",
        content: "Lihat notifikasi terbaru: pesan chat trade, penawaran cocok, dan perubahan status penawaranmu.",
      },
      { property: "og:title", content: "Notifikasi — The Black Prince" },
      { property: "og:description", content: "Update terbaru seputar trade dan chat akunmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const user = useAuthUser();
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery(notificationsQO(user?.id));

  // Realtime: notifikasi baru langsung muncul.
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, qc]);

  // Tandai semua sudah dibaca saat halaman dibuka.
  useEffect(() => {
    if (!user?.id || items.length === 0) return;
    const unread = items.filter((n) => !n.read).map((n) => n.id);
    if (unread.length === 0) return;
    (supabase as any)
      .from("notifications")
      .update({ read: true })
      .in("id", unread)
      .then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
  }, [items, user?.id, qc]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-primary shadow-neon">
            <Bell className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="text-2xl font-black leading-tight md:text-3xl">Notifikasi</h1>
            <p className="text-xs text-muted-foreground">Update trade, chat, dan penawaran cocok.</p>
          </div>
        </div>

        {user === undefined || isLoading ? (
          <Loader2 className="mt-6 h-5 w-5 animate-spin text-primary" />
        ) : user === null ? (
          <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <Link to="/login" className="font-bold text-primary">
              Masuk
            </Link>{" "}
            untuk melihat notifikasimu.
          </p>
        ) : items.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada notifikasi.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {items.map((n) => {
              const body = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 font-bold">{n.title}</p>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("id-ID")}
                  </p>
                </>
              );
              return (
                <li
                  key={n.id}
                  className={
                    "rounded-2xl border p-3 " + (n.read ? "border-border bg-card" : "border-primary/50 bg-primary/5")
                  }
                >
                  {n.link ? (
                    <Link to={n.link} className="block">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}

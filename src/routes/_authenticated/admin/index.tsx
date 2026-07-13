import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Apple, Wrench, UserCircle2, MessageSquare, Radio, Gift, CalendarRange } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

const sb = supabase as any;

function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [fruits, joki, accounts, chats, giveaways, events, live] = await Promise.all([
        sb.from("fruits").select("id,ready", { count: "exact" }),
        sb.from("joki_services").select("id", { count: "exact" }),
        sb.from("accounts").select("id", { count: "exact" }),
        sb.from("chat_messages").select("id", { count: "exact" }),
        sb.from("giveaways").select("id,active", { count: "exact" }),
        sb.from("events").select("id,active", { count: "exact" }),
        sb.from("live_status").select("*").eq("id", 1).maybeSingle(),
      ]);
      return {
        fruitTotal: fruits.count ?? 0,
        fruitReady: (fruits.data ?? []).filter((f: any) => f.ready).length,
        joki: joki.count ?? 0,
        accounts: accounts.count ?? 0,
        chats: chats.count ?? 0,
        giveaways: (giveaways.data ?? []).filter((g: any) => g.active).length,
        events: (events.data ?? []).filter((e: any) => e.active).length,
        live: live.data?.is_live,
      };
    },
  }).data;

  const cards = [
    { label: "Fruit total / ready", value: stats ? `${stats.fruitTotal} / ${stats.fruitReady}` : "…", to: "/admin/fruits", icon: Apple },
    { label: "Layanan Joki", value: stats?.joki ?? "…", to: "/admin/joki", icon: Wrench },
    { label: "Akun Terdaftar", value: stats?.accounts ?? "…", to: "/admin/accounts", icon: UserCircle2 },
    { label: "Total Pesan AI", value: stats?.chats ?? "…", to: "/admin/chats", icon: MessageSquare },
    { label: "Giveaway Aktif", value: stats?.giveaways ?? "…", to: "/admin/giveaways", icon: Gift },
    { label: "Event Aktif", value: stats?.events ?? "…", to: "/admin/events", icon: CalendarRange },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black">Selamat datang bang!</h1>
      <p className="text-sm text-muted-foreground">Ringkasan toko The Black Prince.</p>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4">
        <Link to="/admin/live" className="flex items-center gap-3">
          <span
            className={
              "grid h-11 w-11 place-items-center rounded-xl " +
              (stats?.live ? "bg-red-500/20" : "bg-muted")
            }
          >
            <Radio className={stats?.live ? "h-5 w-5 text-red-400" : "h-5 w-5 text-muted-foreground"} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase text-muted-foreground">Status Live TikTok</p>
            <p className="font-bold">
              {stats?.live ? "🔴 SEDANG LIVE" : "Belum live — klik untuk aktifkan"}
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-neon"
            >
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-3 text-xs uppercase text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-3xl font-black">{c.value}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

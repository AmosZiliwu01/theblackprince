import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { notificationsQO } from "@/lib/trade-offers";
import { supabase } from "@/integrations/supabase/client";

/** Lonceng notifikasi di header — hanya tampil untuk user yang login. */
export function NotificationBell() {
  const user = useAuthUser();
  const qc = useQueryClient();
  const { data: items = [] } = useQuery(notificationsQO(user?.id));
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`notif-bell-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, qc]);

  if (!user) return null;

  return (
    <Link
      to="/notifications"
      aria-label="Notifikasi"
      className="relative grid h-9 w-9 place-items-center rounded-md border border-border bg-card hover:bg-accent"
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground shadow-neon">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

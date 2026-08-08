import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Apple,
  Wrench,
  UserCircle2,
  Users,
  Radio,
  Gift,
  CalendarRange,
  HelpCircle,
  Bot,
  Image as ImageIcon,
  Megaphone,
  Settings,
  MessageSquare,
  LogOut,
  Crown,
  Menu,
  X,
  Tags,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const menu = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/categories", label: "Kategori", icon: Tags },
  { to: "/admin/fruits", label: "Harga Fruit", icon: Apple },
  { to: "/admin/joki", label: "Harga Joki", icon: Wrench },
  { to: "/admin/accounts", label: "Harga Akun", icon: UserCircle2 },
  { to: "/admin/community", label: "Link", icon: Users },
  { to: "/admin/live", label: "Status Live", icon: Radio },
  { to: "/admin/giveaways", label: "Giveaway", icon: Gift },
  { to: "/admin/events", label: "Event", icon: CalendarRange },
  { to: "/admin/faqs", label: "FAQ", icon: HelpCircle },
  { to: "/admin/ai-settings", label: "Pengaturan AI", icon: Bot },
  { to: "/admin/banners", label: "Banner", icon: ImageIcon },
  { to: "/admin/announcements", label: "Announcement", icon: Megaphone },
  { to: "/admin/website", label: "Pengaturan Website", icon: Settings },
  { to: "/admin/chats", label: "Riwayat Chat", icon: MessageSquare },
] as const;

function AdminLayout() {
  const { isAdmin, user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Logout berhasil");
    navigate({ to: "/auth" });
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <Crown className="mx-auto mb-2 h-10 w-10 text-primary" />
          <h1 className="text-xl font-black">Akses ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun <span className="font-mono">{user?.email}</span> belum jadi admin.
          </p>
          <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-left text-xs">
            <p className="mb-1 font-semibold">SQL untuk owner assign admin:</p>
            <pre className="overflow-x-auto text-[11px] text-primary">{`INSERT INTO public.user_roles(user_id, role)
VALUES ('${user?.id}', 'admin');`}</pre>
          </div>
          <button
            onClick={logout}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-neon">
            <Crown className="h-4 w-4 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">Black Prince</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Panel</p>
          </div>
          <button
            className="ml-auto md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {menu.map((m) => {
            const active = pathname === m.to || (m.to !== "/admin" && pathname.startsWith(m.to));
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                onClick={() => setOpen(false)}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition " +
                  (active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-neon"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{m.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-muted-foreground">Admin Dashboard</p>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden truncate sm:inline">{user?.email}</span>
            <Link
              to="/"
              className="rounded-md border border-border px-2 py-1 hover:bg-accent"
            >
              Lihat Situs
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

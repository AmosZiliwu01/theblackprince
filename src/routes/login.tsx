import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login User — The Black Prince" },
      { name: "description", content: "Login cepat pakai username buat fitur trade The Black Prince." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/trade" });
  },
  component: LoginPage,
});

/** Username → email sintetis internal. Password bebas, minimal 6 karakter. */
function toEmail(username: string) {
  const slug = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  return `${slug}@user.blackprince.local`;
}

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (name.length < 3) return toast.error("Username minimal 3 karakter");
    if (password.length < 6) return toast.error("Password minimal 6 karakter");

    setLoading(true);
    try {
      const email = toEmail(name);
      // Coba login dulu; kalau belum punya akun, otomatis dibuatkan.
      let { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const signUp = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (signUp.error) throw new Error("Username sudah dipakai atau password salah");
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) throw retry.error;
      }

      const { data: me } = await supabase.auth.getUser();
      if (me.user) {
        await supabase.from("profiles").upsert({ id: me.user.id, display_name: name });
      }
      toast.success(`Halo, ${name}!`);
      navigate({ to: "/trade" });
    } catch (err: any) {
      toast.error(err?.message ?? "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center gradient-hero p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-card"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl gradient-primary shadow-neon">
            <User className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Login User</p>
            <p className="font-black">Masuk pakai Username</p>
          </div>
        </div>

        <label className="block text-xs font-semibold text-muted-foreground">Username</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username roblox kamu"
          autoComplete="username"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
        />
        <label className="mt-3 block text-xs font-semibold text-muted-foreground">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="bebas, min 6 karakter"
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
        />

        <button
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl gradient-primary py-2.5 text-sm font-bold text-primary-foreground shadow-neon disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Masuk
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Belum punya akun? Langsung isi aja — akunmu otomatis dibuat. Sesi tersimpan, jadi nggak perlu login lagi.
        </p>
      </form>
    </div>
  );
}

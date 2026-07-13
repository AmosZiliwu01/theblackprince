import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login Admin — The Black Prince" },
      { name: "description", content: "Login admin The Black Prince." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/admin" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login berhasil");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Signup berhasil. Cek email untuk konfirmasi jika diminta, lalu login. Ingatkan owner untuk assign role admin.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Auth gagal");
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
            <Crown className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Portal</p>
            <p className="font-black">The Black Prince</p>
          </div>
        </div>

        <div className="mb-4 flex rounded-xl bg-muted p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
                (mode === m ? "bg-background text-foreground shadow" : "text-muted-foreground")
              }
            >
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold text-muted-foreground">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
        />
        <label className="mt-3 block text-xs font-semibold text-muted-foreground">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
        />

        <button
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl gradient-primary py-2.5 text-sm font-bold text-primary-foreground shadow-neon disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Login" : "Buat Akun"}
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Portal ini hanya untuk admin. Setelah signup, minta owner menjalankan SQL untuk assign role admin.
        </p>
      </form>
    </div>
  );
}

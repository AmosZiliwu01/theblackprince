import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function TradeAccess({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const username = name.trim();
    const slug = username.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    if (slug.length < 3 || slug !== username.toLowerCase()) return toast.error("Gunakan minimal 3 huruf/angka tanpa spasi.");
    if (password.length < 6) return toast.error("Kata sandi minimal 6 karakter.");
    setBusy(true);
    try {
      const email = `${slug}@user.blackprince.local`;
      const signIn = await supabase.auth.signInWithPassword({ email, password });
      if (signIn.error) {
        const signUp = await supabase.auth.signUp({ email, password, options: { data: { display_name: username } } });
        if (signUp.error) throw new Error("Nama sudah dipakai atau kata sandi salah.");
        if (!signUp.data.session) {
          const retry = await supabase.auth.signInWithPassword({ email, password });
          if (retry.error) throw new Error("Akun belum bisa dipakai. Coba lagi nanti.");
        }
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Gagal masuk. Coba lagi.");
      await supabase.from("profiles").upsert({ id: data.user.id, display_name: username });
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal masuk.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-label="Masuk untuk Trade" className="w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black">Masuk untuk Trade</h2>
          <Button type="button" variant="ghost" size="icon" aria-label="Tutup" onClick={onClose}><X /></Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Pakai nama panggilan dan kata sandi. Jika baru, akun dibuat otomatis dan tetap tersimpan di perangkat ini.</p>
        <label className="mt-4 block text-xs font-semibold" htmlFor="trade-name">Nama panggilan</label>
        <input id="trade-name" autoFocus required minLength={3} maxLength={32} autoComplete="username" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama panggilanmu" className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm" />
        <label className="mt-3 block text-xs font-semibold" htmlFor="trade-password">Kata sandi</label>
        <input id="trade-password" type="password" required minLength={6} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm" />
        <Button className="mt-5 w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Lanjutkan</Button>
      </form>
    </div>
  );
}
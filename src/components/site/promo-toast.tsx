import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Percent, Clock } from "lucide-react";
import { promotionsQO } from "@/lib/site-queries";
import { isPromoLive, type Promotion } from "@/lib/discount";
import { DescriptionRenderer } from "@/components/site/description";

const SHOW_MS = 10_000; // tampil 10 detik
const CYCLE_MS = 60_000; // muncul tiap 1 menit
const CLOSED_KEY = "tbp_promo_toast_closed";

function fmtDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PromoToast() {
  const promos = (useQuery(promotionsQO).data ?? []) as Promotion[];
  const live = promos
    .filter((p) => isPromoLive(p))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLOSED_KEY) === "1") setClosed(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (closed || live.length === 0) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setIndex((i) => (i + 1) % Math.max(live.length, 1));
      }, SHOW_MS);
    };

    const first = setTimeout(show, 3000); // tampil pertama setelah 3 detik
    const cycle = setInterval(show, CYCLE_MS);

    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(cycle);
    };
  }, [closed, live.length]);

  if (closed || live.length === 0 || !visible) return null;

  const p = live[index % live.length];
  if (!p) return null;

  const start = fmtDate(p.starts_at);
  const end = fmtDate(p.ends_at);

  function close() {
    setVisible(false);
    setClosed(true);
    try {
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {}
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-3 md:inset-x-auto md:bottom-6 md:right-6 md:px-0"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto relative w-full max-w-sm animate-fade-in overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-neon md:w-80">
        <button
          onClick={close}
          aria-label="Tutup promo"
          className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {p.image_url && (
          <div className="relative w-full overflow-hidden rounded-t-2xl bg-black">
            <img
              src={p.image_url}
              alt={p.title}
              className="w-full object-cover object-center"
              loading="lazy"
              style={{ maxHeight: "240px" }}
            />
          </div>
        )}

        <div className="max-h-64 overflow-y-auto p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500 text-xs font-black text-white shadow-neon">
              -{Math.round(Number(p.discount_percent))}%
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black leading-snug">
                {p.title}
              </p>
              {(start || end) && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  {start ? `${start}` : "Mulai sekarang"}
                  {end ? ` — ${end}` : ""}
                </p>
              )}
            </div>
          </div>

          {p.subtitle && (
            <DescriptionRenderer
              text={p.subtitle}
              className="mt-3 text-xs text-muted-foreground"
            />
          )}
        </div>
      </div>
    </div>
  );
}

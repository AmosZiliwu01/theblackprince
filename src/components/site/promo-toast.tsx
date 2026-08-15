import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { X, Clock } from "lucide-react";
import { promotionsQO } from "@/lib/site-queries";
import { isPromoLive, type Promotion } from "@/lib/discount";
import { DescriptionRenderer } from "@/components/site/description";

const SHOW_MS = 10_000; // tampil 10 detik
const CYCLE_MS = 60_000; // muncul tiap 1 menit
const FIRST_DELAY_MS = 3_000;
const CLOSED_KEY = "tbp_promo_toast_closed";
// Halaman yang tidak boleh diganggu popup promo
const HIDDEN_PATHS = ["/cart", "/checkout"];

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hiddenHere = HIDDEN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const promos = (useQuery(promotionsQO).data ?? []) as Promotion[];
  const live = promos
    .filter((p) => isPromoLive(p))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const count = live.length;

  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(-1);
  const [closed, setClosed] = useState(false);
  const nextShowAt = useRef<number>(Date.now() + FIRST_DELAY_MS);
  const hideAt = useRef<number>(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLOSED_KEY) === "1") setClosed(true);
    } catch {}
  }, []);

  // Timestamp-based scheduler: tahan terhadap throttling timer di mobile/PWA
  useEffect(() => {
    if (closed || count === 0 || hiddenHere) {
      setVisible(false);
      return;
    }

    const tick = () => {
      const now = Date.now();
      if (hideAt.current && now >= hideAt.current) {
        hideAt.current = 0;
        nextShowAt.current = now + CYCLE_MS - SHOW_MS;
        setVisible(false);
        return;
      }
      if (!hideAt.current && now >= nextShowAt.current) {
        // Rotasi ke promo berikutnya setiap kali tampil
        setIndex((i) => (i + 1) % count);
        hideAt.current = now + SHOW_MS;
        setVisible(true);
      }
    };

    const id = setInterval(tick, 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [closed, count, hiddenHere]);

  if (closed || hiddenHere || count === 0 || !visible) return null;

  const p = live[((index % count) + count) % count];
  if (!p) return null;

  const start = fmtDate(p.starts_at);
  const end = fmtDate(p.ends_at);

  function close() {
    setVisible(false);
    setClosed(true);
    hideAt.current = 0;
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
              className="mx-auto w-full object-contain"
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

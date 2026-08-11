import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { bannersQO } from "@/lib/site-queries";

const DISMISS_KEY = "tbp_popup_dismissed";

export function PopupBanner() {
  const { data: banners } = useQuery(bannersQO);
  const [open, setOpen] = useState(false);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const popup = (banners ?? []).find((b: any) => b.type === "popup" && b.active);

  useEffect(() => {
    if (!popup) return;
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      setDismissedId(dismissed);
      if (dismissed !== popup.id) {
        // Small delay so it doesn't fight the page's first paint
        const t = setTimeout(() => setOpen(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      setOpen(true);
    }
  }, [popup?.id]);

  function close() {
    setOpen(false);
    if (popup) {
      try {
        sessionStorage.setItem(DISMISS_KEY, popup.id);
      } catch {}
    }
  }


  if (!popup || !open || dismissedId === popup.id) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={popup.title || "Promo"}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-primary/40 bg-card shadow-neon"
      >
        <button
          onClick={close}
          aria-label="Tutup"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>

        {popup.image_url && (
          <img
            src={popup.image_url}
            alt={popup.title || "Promo"}
            className="h-40 w-full object-cover"
          />
        )}

        <div className="p-5 text-center">
          {popup.title && <h2 className="text-xl font-black">{popup.title}</h2>}
          {popup.subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{popup.subtitle}</p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {popup.link && (
              <Link
                to={popup.link}
                onClick={close}
                className="inline-flex items-center justify-center rounded-xl gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-neon hover:brightness-110"
              >
                Lihat Sekarang
              </Link>
            )}
            <button
              onClick={close}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
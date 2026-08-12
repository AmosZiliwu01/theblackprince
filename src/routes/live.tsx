import { DescriptionRenderer } from "@/components/site/description";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { liveStatusQO } from "@/lib/site-queries";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "TikTok Live — The Black Prince" },
      { name: "description", content: "Status live TikTok admin The Black Prince." },
      { property: "og:title", content: "TikTok Live Admin" },
      { property: "og:description", content: "Cek jadwal & status live TikTok admin." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(liveStatusQO),
  component: LivePage,
});

function LivePage() {
  const live = useQuery(liveStatusQO).data as any;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">Live</span> TikTok
        </h1>

        <div className="mt-6 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span
              className={
                "grid h-14 w-14 place-items-center rounded-2xl " +
                (live?.is_live ? "bg-red-500/20" : "bg-muted")
              }
            >
              <Radio className={live?.is_live ? "h-7 w-7 text-red-400" : "h-7 w-7 text-muted-foreground"} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="text-2xl font-black">
                {live?.is_live ? (
                  <span className="text-red-400">🔴 LIVE SEKARANG</span>
                ) : (
                  <span className="text-muted-foreground">Admin belum live</span>
                )}
              </p>
            </div>
          </div>

          {live?.is_live ? (
            <>
              <p className="mt-4 text-lg font-semibold">{live.title}</p>
              {live.live_time && <p className="text-sm text-muted-foreground">Jam: {live.live_time}</p>}
              {live.ai_message && (
                <div className="mt-3 rounded-xl border border-primary/40 bg-primary/10 p-3">
                  <DescriptionRenderer text={live.ai_message} />
                </div>
              )}
              {live.link && (
                <a
                  href={live.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-neon"
                >
                  Join Live Sekarang
                </a>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Saat ini admin belum live. Follow TikTok kami biar dapet notif waktu admin mulai live ya bang.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

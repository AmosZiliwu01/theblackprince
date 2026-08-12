import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { eventsQO } from "@/lib/site-queries";
import { DescriptionRenderer } from "@/components/site/description";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Event — The Black Prince" },
      { name: "description", content: "Event komunitas Blox Fruits The Black Prince." },
      { property: "og:title", content: "Event Blox Fruits" },
      { property: "og:description", content: "Info event mabar, raid, dan update Blox Fruits." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQO),
  component: EventsPage,
});

function EventsPage() {
  const events = (useQuery(eventsQO).data ?? []).filter((e: any) => e.active);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">Event</span>
        </h1>
        <div className="mt-6 space-y-3">
          {events.map((e: any) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary">
                  <CalendarRange className="h-5 w-5 text-primary-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">{e.title}</p>
                  <DescriptionRenderer text={e.description} className="mt-3 text-muted-foreground" />
                  {e.event_date && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      {new Date(e.event_date).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              Belum ada event aktif.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

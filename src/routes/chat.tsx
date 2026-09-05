import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, MessageCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/site-layout";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat AI Admin — The Black Prince" },
      { name: "description", content: "Chat AI Admin The Black Prince sedang dalam perbaikan." },
      { property: "og:title", content: "AI Admin The Black Prince" },
      { property: "og:description", content: "Chat AI Admin The Black Prince sedang dalam perbaikan." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-neon">
          <Wrench className="h-8 w-8 text-primary-foreground" />
        </span>
        <h1 className="mt-5 text-2xl font-black">Chat AI Lagi Perbaikan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Assistant Admin AI sementara ditutup dulu ya bang, lagi kita perbaiki biar makin
          akurat. Coba lagi nanti, atau langsung cek harga fruit, akun, dan trade di menu.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/fruits"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-neon"
          >
            Lihat Harga Fruit
          </Link>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            <MessageCircle className="h-4 w-4" /> Kontak Admin
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}

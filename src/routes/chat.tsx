import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/site-layout";
import { AdminChatLink } from "@/components/site/admin-chat-link";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat Admin via WhatsApp — The Black Prince" },
      { name: "description", content: "Hubungi admin The Black Prince langsung melalui WhatsApp." },
      { property: "og:title", content: "Chat Admin — The Black Prince" },
      { property: "og:description", content: "Hubungi admin The Black Prince langsung melalui WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-neon">
          <MessageCircle className="h-8 w-8 text-primary-foreground" />
        </span>
        <h1 className="mt-5 text-2xl font-black">Chat Admin</h1>
        <AdminChatLink className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-neon">
          <MessageCircle className="h-4 w-4" /> Buka WhatsApp
        </AdminChatLink>
      </div>
    </SiteLayout>
  );
}

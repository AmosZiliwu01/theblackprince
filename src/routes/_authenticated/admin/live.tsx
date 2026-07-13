import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/singleton-editor";

export const Route = createFileRoute("/_authenticated/admin/live")({
  component: () => (
    <SingletonEditor
      table="live_status"
      title="Status Live TikTok"
      description="Toggle live saat admin mulai/selesai live. AI akan otomatis menjawab sesuai status ini."
      fields={[
        { key: "is_live", label: "Sedang Live?", type: "boolean" },
        { key: "title", label: "Judul Live", type: "text", placeholder: "Live give fruit gratis!" },
        { key: "live_time", label: "Jam Live", type: "text", placeholder: "20:00 WIB" },
        { key: "link", label: "Link Live TikTok", type: "text", placeholder: "https://tiktok.com/@..." },
        { key: "ai_message", label: "Pesan AI saat live", type: "textarea", placeholder: "Iya bang, admin lagi live. Join yuk!" },
      ]}
    />
  ),
});

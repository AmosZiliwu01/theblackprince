import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/community")({
  component: () => (
    <AdminCrud
      table="community_links"
      title="Link & Sosial"
      fields={[
        {
          key: "platform",
          label: "Platform",
          type: "select",
          required: true,
          options: [
            { value: "whatsapp", label: "WhatsApp" },
            { value: "discord", label: "Discord" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
            { value: "instagram", label: "Instagram" },
            { value: "website", label: "Website" },
            { value: "other", label: "Lainnya" },
          ],
        },
        { key: "label", label: "Nama Tampilan", type: "text", required: true },
        { key: "url", label: "URL", type: "text", required: true },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
        { key: "platform", label: "Platform" },
        { key: "label", label: "Label" },
        { key: "url", label: "URL" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

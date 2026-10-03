import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/community")({
  component: () => (
    <AdminCrud
      table="community_links"
      title="Link & Sosial"
      description="Atur judul, keterangan, catatan, dan kelompok setiap link yang tampil di halaman pertama."
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
            { value: "roblox", label: "Roblox" },
            { value: "saweria", label: "Saweria" },
            { value: "other", label: "Lainnya" },
          ],
        },
        { key: "label", label: "Judul Link", type: "text", required: true, placeholder: "Contoh: Grup WhatsApp" },
        { key: "link_group", label: "Kelompok (tulis sama persis dengan nama di menu Kelompok Link)", type: "text", required: true, defaultValue: "Sosial & Roblox", placeholder: "Contoh: Chat Admin & Komunitas" },
        { key: "description", label: "Deskripsi Singkat", type: "text", placeholder: "Teks kecil di bawah judul" },
        { key: "note", label: "Catatan (opsional)", type: "text", placeholder: "Info tambahan jika diperlukan" },
        { key: "url", label: "URL", type: "text", required: true },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
        { key: "platform", label: "Platform" },
        { key: "label", label: "Label" },
        { key: "link_group", label: "Kelompok" },
        { key: "url", label: "URL" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

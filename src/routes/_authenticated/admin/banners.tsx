import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: () => (
    <AdminCrud
      table="banners"
      title="Banner"
      fields={[
        {
          key: "type",
          label: "Tipe",
          type: "select",
          required: true,
          defaultValue: "hero",
          options: [
            { value: "hero", label: "Hero" },
            { value: "popup", label: "Popup" },
            { value: "promo", label: "Promo" },
          ],
        },
        { key: "title", label: "Judul", type: "text" },
        { key: "subtitle", label: "Subjudul", type: "textarea" },
        { key: "image_url", label: "URL Gambar", type: "text" },
        { key: "link", label: "Link", type: "text" },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
        { key: "type", label: "Tipe" },
        { key: "title", label: "Judul" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

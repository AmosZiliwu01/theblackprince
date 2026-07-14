import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/joki")({
  component: () => (
    <AdminCrud
      table="joki_services"
      title="Harga Joki"
      description="Kelola daftar layanan joki. Kosongkan stok untuk slot tanpa batas."
      fields={[
        { key: "image_url", label: "Gambar", type: "image", colSpan: 2 },
        { key: "alt_text", label: "Alt Text", type: "text" },
        { key: "name", label: "Nama Layanan", type: "text", required: true },
        { key: "category", label: "Kategori", type: "text", placeholder: "Level / Race / Raid / Awaken" },
        { key: "price", label: "Harga (Rp)", type: "number", required: true },
        { key: "estimation", label: "Estimasi", type: "text", placeholder: "1-2 hari" },
        { key: "stock", label: "Slot (opsional)", type: "number", placeholder: "Kosongkan = unlimited" },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
        { key: "description", label: "Deskripsi", type: "textarea" },
      ]}
      listColumns={[
        {
          key: "image_url",
          label: "Img",
          render: (r) =>
            r.image_url ? (
              <img src={r.image_url} alt="" className="h-8 w-8 rounded object-cover" />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        { key: "name", label: "Layanan" },
        { key: "category", label: "Kategori" },
        {
          key: "price",
          label: "Harga",
          render: (r) => "Rp " + Number(r.price).toLocaleString("id-ID"),
        },
        { key: "estimation", label: "Estimasi" },
        { key: "stock", label: "Slot" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

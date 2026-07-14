import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/fruits")({
  component: () => (
    <AdminCrud
      table="fruits"
      title="Harga Fruit"
      description="Kelola daftar fruit, stok, gambar, dan harga."
      orderBy="sort_order"
      fields={[
        { key: "image_url", label: "Gambar Produk", type: "image", colSpan: 2 },
        { key: "alt_text", label: "Alt Text", type: "text", placeholder: "Gambar buah Dough" },
        { key: "name", label: "Nama", type: "text", required: true },
        { key: "category", label: "Kategori", type: "text", placeholder: "Common / Rare / Legendary / Mythical / Gomu" },
        { key: "price", label: "Harga (Rp)", type: "number", required: true, defaultValue: 0 },
        { key: "stock", label: "Stok", type: "number", defaultValue: 0 },
        { key: "ready", label: "Ready", type: "boolean", defaultValue: true },
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
        { key: "name", label: "Nama" },
        { key: "category", label: "Kategori" },
        {
          key: "price",
          label: "Harga",
          render: (r) => "Rp " + Number(r.price).toLocaleString("id-ID"),
        },
        { key: "stock", label: "Stok" },
        { key: "ready", label: "Ready" },
        { key: "sort_order", label: "Urutan" },
      ]}
    />
  ),
});

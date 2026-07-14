import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/accounts")({
  component: () => (
    <AdminCrud
      table="accounts"
      title="Harga Akun"
      fields={[
        { key: "image_url", label: "Gambar Akun", type: "image", colSpan: 2 },
        { key: "alt_text", label: "Alt Text", type: "text" },
        { key: "name", label: "Nama Akun", type: "text", required: true },
        { key: "level", label: "Level", type: "number" },
        { key: "race", label: "Race", type: "text", placeholder: "Human V4, Ghoul V4, ..." },
        { key: "fruit", label: "Fruit", type: "text" },
        { key: "price", label: "Harga (Rp)", type: "number", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          defaultValue: "ready",
          options: [
            { value: "ready", label: "Ready" },
            { value: "sold", label: "Sold" },
            { value: "limited", label: "Limited" },
          ],
        },
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
        { key: "level", label: "Lv" },
        { key: "race", label: "Race" },
        { key: "fruit", label: "Fruit" },
        {
          key: "price",
          label: "Harga",
          render: (r) => "Rp " + Number(r.price).toLocaleString("id-ID"),
        },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});

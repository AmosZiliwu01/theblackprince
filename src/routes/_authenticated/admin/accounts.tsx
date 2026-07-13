import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/accounts")({
  component: () => (
    <AdminCrud
      table="accounts"
      title="Harga Akun"
      fields={[
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
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
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

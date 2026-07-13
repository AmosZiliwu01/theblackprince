import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/joki")({
  component: () => (
    <AdminCrud
      table="joki_services"
      title="Harga Joki"
      description="Kelola daftar layanan joki."
      fields={[
        { key: "name", label: "Nama Layanan", type: "text", required: true },
        { key: "price", label: "Harga (Rp)", type: "number", required: true },
        { key: "estimation", label: "Estimasi", type: "text", placeholder: "1-2 hari" },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
        { key: "name", label: "Layanan" },
        {
          key: "price",
          label: "Harga",
          render: (r) => "Rp " + Number(r.price).toLocaleString("id-ID"),
        },
        { key: "estimation", label: "Estimasi" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

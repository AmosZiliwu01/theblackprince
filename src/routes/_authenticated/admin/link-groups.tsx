import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/link-groups")({
  component: () => (
    <AdminCrud
      table="link_groups"
      title="Kelompok Link"
      description="Tambah, ganti nama, atur urutan kelompok di halaman pertama. Saat ganti nama, sesuaikan juga kelompok di menu Link."
      orderBy="sort_order"
      fields={[
        { key: "name", label: "Nama Kelompok", type: "text", required: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
      ]}
      listColumns={[
        { key: "name", label: "Nama" },
        { key: "sort_order", label: "Urutan" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: () => (
    <AdminCrud
      table="fruit_categories"
      title="Kategori Fruit"
      description="Kategori digunakan untuk pengelompokan pada halaman Fruit."
      fields={[
        { key: "name", label: "Nama", type: "text", required: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
        { key: "name", label: "Nama" },
        { key: "sort_order", label: "Urutan" },
      ]}
    />
  ),
});

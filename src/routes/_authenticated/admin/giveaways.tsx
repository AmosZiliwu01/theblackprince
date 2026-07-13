import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/giveaways")({
  component: () => (
    <AdminCrud
      table="giveaways"
      title="Giveaway"
      orderBy="created_at"
      orderAsc={false}
      fields={[
        { key: "name", label: "Nama Giveaway", type: "text", required: true },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "prize", label: "Hadiah", type: "text" },
        { key: "how_to_join", label: "Cara Ikut", type: "textarea" },
        { key: "ends_at", label: "Deadline", type: "datetime" },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
      ]}
      listColumns={[
        { key: "name", label: "Nama" },
        { key: "prize", label: "Hadiah" },
        { key: "active", label: "Aktif" },
        {
          key: "ends_at",
          label: "Deadline",
          render: (r) => (r.ends_at ? new Date(r.ends_at).toLocaleString("id-ID") : "—"),
        },
      ]}
    />
  ),
});

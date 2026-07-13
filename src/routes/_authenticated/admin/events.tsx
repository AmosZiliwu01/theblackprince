import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: () => (
    <AdminCrud
      table="events"
      title="Event"
      orderBy="created_at"
      orderAsc={false}
      fields={[
        { key: "title", label: "Judul", type: "text", required: true },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "event_date", label: "Tanggal", type: "datetime" },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
      ]}
      listColumns={[
        { key: "title", label: "Judul" },
        {
          key: "event_date",
          label: "Tanggal",
          render: (r) => (r.event_date ? new Date(r.event_date).toLocaleString("id-ID") : "—"),
        },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

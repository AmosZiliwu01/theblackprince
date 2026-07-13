import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: () => (
    <AdminCrud
      table="announcements"
      title="Announcement (running text)"
      orderBy="created_at"
      orderAsc={false}
      fields={[
        { key: "message", label: "Pesan", type: "text", required: true },
        { key: "active", label: "Aktif", type: "boolean", defaultValue: true },
      ]}
      listColumns={[
        { key: "message", label: "Pesan" },
        { key: "active", label: "Aktif" },
      ]}
    />
  ),
});

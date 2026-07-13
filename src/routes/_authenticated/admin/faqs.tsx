import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: () => (
    <AdminCrud
      table="faqs"
      title="FAQ"
      fields={[
        { key: "question", label: "Pertanyaan", type: "text", required: true },
        { key: "answer", label: "Jawaban", type: "textarea", required: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
      ]}
      listColumns={[
        { key: "question", label: "Pertanyaan" },
        { key: "sort_order", label: "Urutan" },
      ]}
    />
  ),
});

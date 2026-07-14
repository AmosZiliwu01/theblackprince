import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/singleton-editor";

export const Route = createFileRoute("/_authenticated/admin/website")({
  component: () => (
    <SingletonEditor
      table="website_settings"
      title="Pengaturan Website"
      fields={[
        { key: "site_name", label: "Nama Situs", type: "text" },
        { key: "tagline", label: "Tagline", type: "text" },
        { key: "logo_url", label: "URL Logo", type: "text" },
        { key: "whatsapp_number", label: "Nomor WhatsApp (628xxx)", type: "text", placeholder: "6281234567890" },
        { key: "whatsapp_greeting", label: "Template Sapaan WhatsApp", type: "textarea", placeholder: "Halo admin, saya mau order:" },
      ]}
    />
  ),
});

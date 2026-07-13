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
      ]}
    />
  ),
});

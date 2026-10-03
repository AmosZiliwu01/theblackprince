import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/singleton-editor";

export const Route = createFileRoute("/_authenticated/admin/website")({
  component: () => (
    <SingletonEditor
      table="website_settings"
      title="Pengaturan Website & Halaman Utama"
      fields={[
        { key: "site_name", label: "Judul Utama Halaman Pertama", type: "text", placeholder: "The Black Prince" },
        { key: "tagline", label: "Tagline", type: "text" },
        { key: "logo_url", label: "Logo", type: "image" },
        { key: "store_cta_title", label: "Tombol Toko — Judul", type: "text", placeholder: "Beli di The Black Prince Store" },
        { key: "store_cta_description", label: "Tombol Toko — Deskripsi", type: "text", placeholder: "Buah, akun, dan jasa joki" },
        { key: "whatsapp_number", label: "Nomor WhatsApp (628xxx)", type: "text", placeholder: "6281234567890" },
        { key: "whatsapp_greeting", label: "Template Sapaan WhatsApp", type: "textarea", placeholder: "Halo admin, saya mau order:" },
        { key: "payment_enabled", label: "Tampilkan Info Pembayaran di Halaman Utama", type: "boolean" },
        { key: "payment_qris_url", label: "Gambar QRIS (opsional)", type: "image" },
        { key: "payment_wallet_number", label: "Nomor DANA / GoPay (opsional)", type: "text", placeholder: "08xxxxxxxxxx" },
        { key: "payment_note", label: "Catatan Pembayaran", type: "textarea", placeholder: "Atau minta QRIS / nomor lewat WhatsApp admin." },
      ]}
    />
  ),
});

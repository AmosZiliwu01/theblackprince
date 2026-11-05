import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/admin-crud";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

function BulkReady() {
  const run = async (ready: boolean) => {
    if (!confirm(ready ? "Aktifkan semua buah yang sudah punya harga?" : "Nonaktifkan semua buah?")) return;
    let q = supabase.from("fruits").update({ ready });
    q = ready ? q.gt("price", 0) : q.eq("ready", true);
    const { error } = await q;
    if (error) return alert(error.message);
    location.reload();
  };
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <Button size="sm" onClick={() => run(true)}>Aktifkan semua (yang ada harga)</Button>
      <Button size="sm" variant="outline" onClick={() => run(false)}>Nonaktifkan semua</Button>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/fruits")({
  component: () => (
    <>
    <BulkReady />
    <AdminCrud
      table="fruits"
      title="Harga Fruit"
      description="Kelola daftar fruit, stok, gambar, dan harga."
      orderBy="sort_order"
      fields={[
        { key: "image_url", label: "Gambar Produk", type: "image", colSpan: 2 },
        { key: "alt_text", label: "Alt Text", type: "text", placeholder: "Gambar buah Dough" },
        { key: "name", label: "Nama", type: "text", required: true },
        { key: "category", label: "Kategori", type: "text", placeholder: "Common / Rare / Legendary / Mythical / Gomu" },
        { key: "price", label: "Harga (Rp)", type: "number", required: true, defaultValue: 0 },
        { key: "price_rm", label: "Harga (RM)", type: "number", placeholder: "Opsional, misal 3" },
        { key: "stock", label: "Stok", type: "number", defaultValue: 0 },
        { key: "ready", label: "Ready", type: "boolean", defaultValue: true },
        { key: "sort_order", label: "Urutan", type: "number", defaultValue: 0 },
        { key: "description", label: "Deskripsi", type: "textarea" },
      ]}
      listColumns={[
        {
          key: "image_url",
          label: "Img",
          render: (r) =>
            r.image_url ? (
              <img src={r.image_url} alt="" className="h-8 w-8 rounded object-cover" />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        { key: "name", label: "Nama" },
        { key: "category", label: "Kategori" },
        {
          key: "price",
          label: "Harga",
          render: (r) =>
            Number(r.price) <= 0 ? "Belum ada harga" : "Rp " + Number(r.price).toLocaleString("id-ID") + (r.price_rm ? ` | RM ${Number(r.price_rm).toLocaleString("en-MY", { minimumFractionDigits: 2 })}` : ""),
        },
        { key: "stock", label: "Stok" },
        { key: "ready", label: "Ready" },
        { key: "sort_order", label: "Urutan" },
      ]}
    />
    </>
  ),
});
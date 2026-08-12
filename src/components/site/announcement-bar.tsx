import { useQuery } from "@tanstack/react-query";
import { announcementsQO } from "@/lib/site-queries";

export function AnnouncementBar() {
  const { data } = useQuery(announcementsQO);
  const items = (data ?? []).filter((a: any) => a.active);
  if (items.length === 0) return null;
  // Running text harus tetap satu baris: baris baru dari admin diubah jadi separator.
  const text = items
    .map((a: any) =>
      String(a.message ?? "")
        .split(/\n+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .join(" • "),
    )
    .filter(Boolean)
    .join("   •   ");
  return (
    <div className="w-full overflow-hidden border-b border-border bg-gradient-to-r from-secondary/40 via-primary/30 to-secondary/40 py-1.5">
      <div className="flex whitespace-nowrap animate-marquee text-xs font-medium text-primary-foreground/90">
        <span className="px-6">{text}</span>
        <span className="px-6">{text}</span>
      </div>
    </div>
  );
}

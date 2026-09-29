import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { websiteSettingsQO } from "@/lib/site-queries";

export function AdminChatLink({ children, className }: { children: ReactNode; className?: string }) {
  const { data: settings } = useQuery(websiteSettingsQO);
  const phone = String(settings?.whatsapp_number ?? "").replace(/\D/g, "");
  const greeting = "Halo admin The Black Prince, saya mau bertanya.";

  if (!phone) return <span className={className} title="Nomor WhatsApp admin belum tersedia">{children}</span>;

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
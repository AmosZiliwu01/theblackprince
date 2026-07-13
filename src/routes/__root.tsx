import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang kamu cari nggak ada atau sudah dipindah, bang.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-neon transition-transform hover:scale-105"
          >
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Halaman ini gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ada yang error nih. Coba refresh atau balik ke home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#12100f" },
      { title: "The Black Prince — Blox Fruits Shop, Joki & Community" },
      {
        name: "description",
        content:
          "Marketplace Blox Fruits terpercaya: jual fruit, akun, jasa joki, komunitas, event, giveaway & live TikTok. Chat AI Admin 24/7.",
      },
      { name: "author", content: "The Black Prince" },
      { property: "og:title", content: "The Black Prince — Blox Fruits Shop, Joki & Community" },
      {
        property: "og:description",
        content:
          "Marketplace Blox Fruits terpercaya: jual fruit, akun, jasa joki, komunitas, event, giveaway & live TikTok. Chat AI Admin 24/7.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Black Prince — Blox Fruits Shop, Joki & Community" },
      { name: "twitter:description", content: "Marketplace Blox Fruits terpercaya: jual fruit, akun, jasa joki, komunitas, event, giveaway & live TikTok. Chat AI Admin 24/7." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/znHrrt2eK0MlZ2wdnYxx2MNZCD63/social-images/social-1783953747362-WhatsApp_Image_2026-07-10_at_09.30.02.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/znHrrt2eK0MlZ2wdnYxx2MNZCD63/social-images/social-1783953747362-WhatsApp_Image_2026-07-10_at_09.30.02.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.025 35)",
            border: "1px solid oklch(0.28 0.03 35)",
            color: "oklch(0.97 0.01 60)",
          },
        }}
      />
    </QueryClientProvider>
  );
}

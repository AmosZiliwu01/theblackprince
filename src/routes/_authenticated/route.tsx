import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");
    const isAdmin = (roles ?? []).length > 0;
    return { user: data.user, isAdmin };
  },
  component: () => <Outlet />,
});

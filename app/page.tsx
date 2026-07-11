import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/server/services/dashboardService";
import type { DashboardData } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = (await getDashboardData(user.id)) as DashboardData;
  return <DashboardShell data={data} />;
}

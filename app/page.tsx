import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getUserId } from "@/lib/server/auth";
import { getDashboardData } from "@/lib/server/services/dashboardService";
import type { DashboardData } from "@/lib/types";

export default async function Home() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const data = (await getDashboardData(userId)) as DashboardData;
  return <DashboardShell data={data} />;
}

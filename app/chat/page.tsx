import { redirect } from "next/navigation";
import { ChatPageClient } from "@/components/chat/chat-page-client";
import { getUserId } from "@/lib/server/auth";
import { getDashboardData } from "@/lib/server/services/dashboardService";
import type { DashboardData } from "@/lib/types";

export default async function ChatPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const data = (await getDashboardData(userId)) as DashboardData;
  return (
    <ChatPageClient
      user={data.user}
      greetingSubtitle={data.greetingSubtitle}
      suggestions={data.chatSuggestions}
    />
  );
}

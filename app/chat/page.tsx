import { redirect } from "next/navigation";
import { ChatPageClient } from "@/components/chat/chat-page-client";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/server/services/dashboardService";
import type { DashboardData } from "@/lib/types";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = (await getDashboardData(user.id)) as DashboardData;
  return (
    <ChatPageClient
      user={data.user}
      greetingSubtitle={data.greetingSubtitle}
      suggestions={data.chatSuggestions}
    />
  );
}

import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Avatar } from "@/components/ui/avatar";
import { getUserId } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

/**
 * Bare shell for the onboarding flow — just the logo + avatar, no sidebar,
 * no "Ask AI" button. Distinct from both the auth pages' centered Card
 * layout and the dashboard's AppShell; matches the onboarding mockups.
 */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo className="h-7 w-auto" />
        <Avatar initials={initials} name={user.name} />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}

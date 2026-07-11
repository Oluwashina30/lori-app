import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SparkleIcon } from "@/components/icons";
import type { UserProfile } from "@/lib/types";

export interface TopHeaderProps {
  user: UserProfile;
}

export function TopHeader({ user }: TopHeaderProps) {
  return (
    <header className="hidden items-center justify-end gap-4 md:flex">
      <Link href="/chat" className={buttonVariants({ variant: "outline", size: "default" })} aria-label="Ask AI">
        <SparkleIcon className="h-4 w-4" />
        Ask AI
      </Link>
      <Avatar initials={user.initials} name={user.name} />
    </header>
  );
}

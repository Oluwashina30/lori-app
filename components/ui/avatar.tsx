import { cn } from "@/lib/utils";

export interface AvatarProps {
  initials: string;
  name: string;
  className?: string;
}

/** Simple initials avatar. Swap for a real <Image> once user photos are available. */
export function Avatar({ initials, name, className }: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={`${name}'s avatar`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-background",
        className
      )}
    >
      {initials}
    </div>
  );
}

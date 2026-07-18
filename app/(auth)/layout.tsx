import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/"
        className="fixed left-4 top-4 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <Link href="/" className="mb-8">
        <Logo className="h-8 w-auto" />
      </Link>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

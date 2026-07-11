import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-medium text-foreground">Welcome back</h1>
        <p className="text-sm text-muted">Sign in to your Lori account</p>
      </div>
      {error && (
        <p className="rounded-lg border border-negative/30 bg-negative/10 px-3 py-2 text-sm text-negative">
          {error}
        </p>
      )}
      <LoginForm />
    </Card>
  );
}

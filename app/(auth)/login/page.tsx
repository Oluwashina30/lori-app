import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-medium text-foreground">Welcome back</h1>
        <p className="text-sm text-muted">Sign in to your Lori account</p>
      </div>
      <LoginForm />
    </Card>
  );
}

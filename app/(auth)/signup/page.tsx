import { Card } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-medium text-foreground">Create your account</h1>
        <p className="text-sm text-muted">Start tracking and growing your savings</p>
      </div>
      <SignupForm />
    </Card>
  );
}

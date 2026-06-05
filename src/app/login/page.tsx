import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SignInButton } from "@/components/auth/sign-in-button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Mental Health Lab</p>
        <h1 className="mt-4 text-3xl font-semibold text-text">Кабінет студентів-психологів</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Увійдіть через Google, щоб перейти до навчального кабінету та тестування.
        </p>
        <div className="mt-8">
          <SignInButton />
        </div>
      </Card>
    </main>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/auth-form";
import AuthShell from "../shell";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const userCount = await prisma.user.count();
  const showRegister = userCount === 0 && !(await prisma.session.count());

  return (
    <AuthShell
      title="Sign in"
      subtitle="Enter your credentials to access the dashboard."
      hint={
        showRegister ? (
          <>
            No account yet?{" "}
            <Link href="/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Set up your store
            </Link>
          </>
        ) : null
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
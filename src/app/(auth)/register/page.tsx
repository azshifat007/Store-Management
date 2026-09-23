import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "@/components/auth-form";
import AuthShell from "../shell";

export default async function RegisterPage() {
  const userCount = await prisma.user.count();
  const sessions = await prisma.session.count();
  const allowed = userCount === 0 && sessions === 0;

  if (!allowed) {
    return (
      <AuthShell
        title="Already set up"
        subtitle="This store already has an owner account."
        hint={
          <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Go to sign in
          </Link>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Account setup has already been completed. Please sign in with the owner
          credentials instead.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set up your store"
      subtitle="Create the owner account to get started."
      hint={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
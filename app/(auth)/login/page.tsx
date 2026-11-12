import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { dashboardPathForRole, getSessionUser } from "@/lib/auth";
import { googleEnabled } from "@/lib/oauth";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSessionUser();
  if (session) redirect(dashboardPathForRole(session.role));

  const params = await searchParams;

  return (
    <LoginForm
      googleEnabled={googleEnabled}
      initialError={params.error}
      nextPath={params.next}
    />
  );
}

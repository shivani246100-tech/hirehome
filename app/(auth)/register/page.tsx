import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { dashboardPathForRole, getSessionUser } from "@/lib/auth";
import { googleEnabled } from "@/lib/oauth";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await getSessionUser();
  if (session) redirect(dashboardPathForRole(session.role));

  const params = await searchParams;
  const initialRole = params.role === "employer" ? "EMPLOYER" : "SEEKER";

  return <RegisterForm googleEnabled={googleEnabled} initialRole={initialRole} />;
}

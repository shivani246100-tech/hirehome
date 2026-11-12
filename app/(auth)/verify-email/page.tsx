import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/verify-email-form";

export const metadata: Metadata = { title: "Verify your email" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return <VerifyEmailForm token={params.token ?? ""} />;
}

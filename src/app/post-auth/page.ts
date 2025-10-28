// src/app/post-auth/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PostAuth() {
  const session = await getServerSession(authConfig);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  // Always trust DB for role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, proStatus: true },
  });

  if (user?.role === "ADMIN") redirect("/admin");
  if (user?.proStatus && user.proStatus !== "APPROVED") redirect("/pro/onboarding");
  if (user?.proStatus === "APPROVED") redirect("/pro");

  // Homeowners go to /home; that page will self-redirect if they already claimed
  redirect("/home");
}
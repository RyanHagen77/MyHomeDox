// app/admin/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authConfig);
  if (!session) redirect("/login");
  if ((session as any).role !== "ADMIN") redirect("/home");

  return <main className="p-6">Admin dashboard</main>;
}
// src/app/home/new/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export default async function NewHomePage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) redirect("/login");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Create your home</h1>
      {/* TODO: your form to create a Home, then push(`/home/${created.id}`) */}
    </main>
  );
}
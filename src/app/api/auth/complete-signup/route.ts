import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { role } = (await req.json()) as { role: "HOMEOWNER" | "PRO" };
  if (!["HOMEOWNER", "PRO"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { role },
    select: { id: true, email: true, role: true, name: true },
  });
  return NextResponse.json(user);
}
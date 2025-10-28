import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireHomeAccess } from "@/lib/authz";

export async function GET(_req: Request, ctx: { params: Promise<{ homeId: string }> }) {
  const { homeId } = await ctx.params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireHomeAccess(homeId, session.user.id);

  const items = await prisma.reminder.findMany({
    where: { homeId },
    orderBy: { dueAt: "asc" },
    select: { id: true, title: true, dueAt: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request, ctx: { params: Promise<{ homeId: string }> }) {
  const { homeId } = await ctx.params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireHomeAccess(homeId, session.user.id);

  const body = await req.json();
  const r = await prisma.reminder.create({
    data: {
      homeId,
      title: String(body.title ?? "Reminder"),
      dueAt: body.dueAt ? new Date(body.dueAt) : new Date(),
      createdBy: (session.user as any).id,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: r.id }, { status: 201 });
}
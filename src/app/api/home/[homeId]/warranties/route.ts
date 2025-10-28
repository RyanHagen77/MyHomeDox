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

  const items = await prisma.warranty.findMany({
    where: { homeId },
    orderBy: { expiresAt: "asc" },
    select: { id: true, item: true, provider: true, policyNo: true, expiresAt: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request, ctx: { params: Promise<{ homeId: string }> }) {
  const { homeId } = await ctx.params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireHomeAccess(homeId, session.user.id);

  const body = await req.json();
  const w = await prisma.warranty.create({
    data: {
      homeId,
      item: String(body.item ?? "Item"),
      provider: body.provider ?? null,
      policyNo: body.policyNo ?? null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: w.id }, { status: 201 });
}
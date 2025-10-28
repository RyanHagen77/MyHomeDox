import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireHomeAccess } from "@/lib/authz";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ homeId: string; recordId: string }> }
) {
  const { homeId, recordId } = await ctx.params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireHomeAccess(homeId, session.user.id);

  const body = await req.json();
  await prisma.record.update({
    where: { id: recordId },
    data: {
      title: body.title ?? undefined,
      note: body.note ?? undefined,
      kind: body.kind ?? undefined,
      date: body.date ? new Date(body.date) : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ homeId: string; recordId: string }> }
) {
  const { homeId, recordId } = await ctx.params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireHomeAccess(homeId, session.user.id);

  await prisma.record.delete({ where: { id: recordId } });
  return NextResponse.json({ ok: true });
}
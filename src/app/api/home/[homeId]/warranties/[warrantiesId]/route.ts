import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireHomeAccess } from "@/lib/authz";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ homeId: string; warrantyId: string }> }
) {
  const { homeId, warrantyId } = await ctx.params;
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireHomeAccess(homeId, session.user.id);

  await prisma.warranty.delete({ where: { id: warrantyId } });
  return NextResponse.json({ ok: true });
}
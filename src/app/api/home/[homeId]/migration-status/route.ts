import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHomeAccess } from "@/lib/authz";
import { authConfig } from "@/lib/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ homeId: string }> }
) {
  const { homeId } = await ctx.params;     // 👈 await it
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  await requireHomeAccess(homeId, userId);

  const access = await prisma.homeAccess.findUnique({
    where: { homeId_userId: { homeId, userId } },
    select: { migratedAt: true },
  });

  return NextResponse.json({ migrated: !!access?.migratedAt });
}
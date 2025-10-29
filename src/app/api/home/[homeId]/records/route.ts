import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireHomeAccess } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ homeId: string }> }   // <- Promise
) {
  const { homeId } = await ctx.params;            // <- await
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await requireHomeAccess(homeId, session.user.id);

  const items = await prisma.record.findMany({
    where: { homeId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      note: true,
      date: true,
      kind: true,
      vendor: true,
      cost: true,
    },
  });
  return NextResponse.json({ items });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ homeId: string }> }    // <- Promise
) {
  const { homeId } = await ctx.params;            // <- await
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await requireHomeAccess(homeId, session.user.id);

  const body = await req.json();

  const rec = await prisma.record.create({
    data: {
      homeId,
      title: String(body.title ?? "Untitled"),
      note: body.note ?? null,
      kind: body.kind ?? null,
      vendor: body.vendor ?? null,
      cost:
        typeof body.cost === "number"
          ? body.cost
          : body.cost
          ? Number(body.cost)
          : null,
      date: body.date ? new Date(body.date) : new Date(),
      createdBy: session.user.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: rec.id }, { status: 201 });
}
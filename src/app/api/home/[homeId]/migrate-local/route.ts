import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHomeAccess } from "@/lib/authz";
import { authConfig } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ homeId: string }> }  // 👈 params is a Promise
) {
  const { homeId } = await ctx.params;          // 👈 await it once
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  await requireHomeAccess(homeId, userId);

  const { records = [], reminders = [], warranties = [] } = await req.json();

  // Idempotency: if migratedAt is set, refuse to re-import
  const access = await prisma.homeAccess.findUnique({
    where: { homeId_userId: { homeId, userId } },
    select: { migratedAt: true },
  });
  if (access?.migratedAt) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await prisma.$transaction(async (tx) => {
    if (Array.isArray(records) && records.length) {
      await tx.record.createMany({
        data: records.map((r: any) => ({
          homeId,
          title: String(r.title ?? "Note"),
          note: r.note ?? null,
          kind: r.kind ?? null,
          date: r.date ? new Date(r.date) : new Date(),
          createdBy: userId,
        })),
        skipDuplicates: true,
      });
    }

    if (Array.isArray(reminders) && reminders.length) {
      await tx.reminder.createMany({
        data: reminders.map((m: any) => ({
          homeId,
          title: String(m.title ?? "Reminder"),
          dueAt: m.dueAt ? new Date(m.dueAt) : new Date(),
          createdBy: userId,
        })),
        skipDuplicates: true,
      });
    }

    if (Array.isArray(warranties) && warranties.length) {
      await tx.warranty.createMany({
        data: warranties.map((w: any) => ({
          homeId,
          item: String(w.item ?? "Item"),
          provider: w.provider ?? null,
          expiresAt: w.expiresAt ? new Date(w.expiresAt) : null,
        })),
        skipDuplicates: true,
      });
    }

    // ✅ Use upsert so we don't crash if HomeAccess doesn't exist yet
    await tx.homeAccess.upsert({
      where: { homeId_userId: { homeId, userId } },
      update: { migratedAt: new Date() },
      create: { homeId, userId, role: "owner", migratedAt: new Date() },
    });

    // Optional: mark data source
    await tx.home.update({
      where: { id: homeId },
      data: { meta: { set: { dataSource: "Local" } } },
    });
  });

  return NextResponse.json({ ok: true });
}
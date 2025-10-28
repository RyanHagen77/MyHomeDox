import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await req.json();
    const address = String(body.address ?? "").trim();
    const city = (body.city ?? "").trim();
    const state = (body.state ?? "").trim();
    const zip = (body.zip ?? "").trim();

    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    // 1️⃣ Check if this user already owns a home at that address
    const existing = await prisma.home.findFirst({
      where: { ownerId: userId, address, city, state, zip },
      select: { id: true },
    });

    let homeId: string;

    if (existing) {
      // Ensure HomeAccess exists
      await prisma.homeAccess.upsert({
        where: { homeId_userId: { homeId: existing.id, userId } },
        update: { role: "owner" },
        create: { homeId: existing.id, userId, role: "owner" },
      });

      homeId = existing.id;
    } else {
      // 2️⃣ Create a new home and owner access
      const home = await prisma.home.create({
        data: {
          ownerId: userId,
          address,
          city,
          state,
          zip,
        },
        select: { id: true },
      });

      await prisma.homeAccess.create({
        data: { homeId: home.id, userId, role: "owner" },
      });

      homeId = home.id;
    }

    // 3️⃣ Always update user's lastHomeId
    await prisma.user.update({
      where: { id: userId },
      data: { lastHomeId: homeId },
    });

    // 4️⃣ Done
    return NextResponse.json({ id: homeId }, { status: 200 });
  } catch (err: any) {
    console.error("Claim home error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Could not claim home" },
      { status: 500 },
    );
  }
}
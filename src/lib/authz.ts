// src/lib/authz.ts
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function requireHomeAccess(homeId?: string, userId?: string) {
  if (!homeId) {
    const err = new Error("Bad Request: homeId missing");
    // @ts-ignore
    err.status = 400;
    throw err;
  }
  if (!userId) {
    const err = new Error("Unauthorized");
    // @ts-ignore
    err.status = 401;
    throw err;
  }

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    select: { id: true, ownerId: true },
  });
  if (!home) notFound();

  if (home.ownerId === userId) return { home };

  const access = await prisma.homeAccess.findUnique({
    where: { homeId_userId: { homeId, userId } },
    select: { id: true },
  });

  if (!access) {
    const err = new Error("Forbidden");
    // @ts-ignore
    err.status = 403;
    throw err;
  }
  return { home };
}
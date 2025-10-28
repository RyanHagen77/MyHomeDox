// src/app/home/page.tsx
import "server-only";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HomePreClaim from "./_components/HomePreClaim";

export const dynamic = "force-dynamic";

export default async function HomeIndex() {
  const session = await getServerSession(authConfig);
  const userId = (session?.user as any)?.id as string | undefined;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastHomeId: true },
    });

    let homeId = user?.lastHomeId ?? null;

    if (!homeId) {
      const owned = await prisma.home.findFirst({
        where: { ownerId: userId },
        select: { id: true },
      });
      homeId = owned?.id ?? null;
    }

    if (!homeId) {
      const shared = await prisma.homeAccess.findFirst({
        where: { userId },
        select: { homeId: true },
      });
      homeId = shared?.homeId ?? null;
    }

    if (homeId) redirect(`/home/${homeId}`);
  }

  // Not logged in or no claimed home → show pre-claim dummy UI
  return <HomePreClaim />;
}
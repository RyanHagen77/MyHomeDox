// src/app/api/home/[homeId]/records/[recordId]/attachments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireHomeAccess } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { PUBLIC_S3_URL_PREFIX } from "@/lib/s3";

export const runtime = "nodejs";

type Params = { homeId: string; recordId: string };
type Incoming = {
  filename: string;
  size: number;
  contentType: string;
  storageKey: string;
  url?: string | null;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<Params> }   // ⬅️ params is a Promise
) {
  const { homeId, recordId } = await ctx.params;  // ⬅️ await it

  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await requireHomeAccess(homeId, session.user.id);

  const rec = await prisma.record.findUnique({
    where: { id: recordId },
    select: { id: true, homeId: true },
  });
  if (!rec || rec.homeId !== homeId) {
    return NextResponse.json({ error: "Record not found for this home" }, { status: 404 });
  }

  let items: unknown;
  try {
    items = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Expected a non-empty array" }, { status: 400 });
  }

  const rows: Incoming[] = [];
  for (const it of items as Incoming[]) {
    if (
      !it ||
      typeof it.filename !== "string" ||
      typeof it.storageKey !== "string" ||
      typeof it.contentType !== "string" ||
      typeof it.size !== "number"
    ) {
      return NextResponse.json({ error: "Invalid attachment shape" }, { status: 400 });
    }
    rows.push(it);
  }

  const data = rows.map((r) => ({
    homeId,
    recordId,
    key: r.storageKey,
    url: r.url ?? `${PUBLIC_S3_URL_PREFIX}/${r.storageKey}`,
    filename: r.filename,
    mimeType: r.contentType,
    size: Math.max(0, Math.floor(r.size)),
    uploadedBy: session.user.id,
  }));

  await prisma.attachment.createMany({ data });
  return NextResponse.json({ ok: true, count: data.length }, { status: 200 });
}
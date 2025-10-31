// src/app/api/uploads/presign/route.ts
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, buildRecordKey, buildReminderKey, buildWarrantyKey, PUBLIC_S3_URL_PREFIX } from "@/lib/s3";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireHomeAccess } from "@/lib/authz";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { homeId, recordId, warrantyId, reminderId, filename, mimeType, contentType, size } = body ?? {};

  // At least one ID must be present
  if (!homeId || (!recordId && !warrantyId && !reminderId) || !filename || typeof size !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Use either mimeType or contentType (for backwards compatibility)
  const finalContentType = mimeType || contentType;
  if (!finalContentType) {
    return NextResponse.json({ error: "Missing content type" }, { status: 400 });
  }

  // Gate access to the home
  await requireHomeAccess(homeId, session.user.id);

  // Build the appropriate key based on entity type
  let key: string;
  if (recordId) {
    key = buildRecordKey(homeId, recordId, filename);
  } else if (reminderId) {
    key = buildReminderKey(homeId, reminderId, filename);
  } else if (warrantyId) {
    key = buildWarrantyKey(homeId, warrantyId, filename);
  } else {
    return NextResponse.json({ error: "No entity ID provided" }, { status: 400 });
  }

  const cmd = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: finalContentType,
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 }); // 60s PUT URL
  // Public GET (if you want to immediately show thumbnail in dev)
  const publicUrl = PUBLIC_S3_URL_PREFIX ? `${PUBLIC_S3_URL_PREFIX}/${key}` : null;

  return NextResponse.json({ key, url, publicUrl }, { status: 200 });
}
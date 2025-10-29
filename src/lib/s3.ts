// src/lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

/* --- Safe env helpers --- */
function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/* --- Environment detection with fallbacks --- */
export const AWS_REGION =
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  "us-east-1";

export const S3_BUCKET =
  process.env.S3_BUCKET ||
  process.env.AWS_S3_BUCKET ||
  must("S3_BUCKET"); // fail loudly if both missing

export const AWS_ACCESS_KEY_ID = must("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = must("AWS_SECRET_ACCESS_KEY");

/* --- Public URL prefix (for GETs) --- */
// Reject invalid console URLs, or auto-derive a correct one
const derivedPrefix = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;
export const PUBLIC_S3_URL_PREFIX =
  process.env.PUBLIC_S3_URL_PREFIX &&
  !/console\.aws\.amazon\.com/i.test(process.env.PUBLIC_S3_URL_PREFIX)
    ? process.env.PUBLIC_S3_URL_PREFIX
    : derivedPrefix;

/* --- S3 client --- */
export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/* --- Build keys for records --- */
export function buildRecordKey(
  homeId: string,
  recordId: string,
  filename: string
) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `homes/${homeId}/records/${recordId}/${Date.now()}_${safeName}`;
}
// =============================================
// File: src/app/api/property/lookup/route.ts
// =============================================
import { NextResponse } from "next/server";
import { lookupByAddress } from "@/lib/mock";

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address || typeof address !== "string") {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  const data = await lookupByAddress(address);
  return NextResponse.json(data);
}
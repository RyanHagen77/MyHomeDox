// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

export const runtime = "nodejs";          // ✅ force Node (not Edge)
export const dynamic = "force-dynamic";   // avoids static bundling

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
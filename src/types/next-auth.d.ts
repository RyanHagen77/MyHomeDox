import type { Role, ProStatus } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: Role;
      proStatus?: ProStatus | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    proStatus?: ProStatus | null;
  }
}
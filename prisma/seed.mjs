// prisma/seed.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const email = "admin@mydwallo.com";
const passwordHash = await bcrypt.hash("Admin1234!", 10);

await prisma.user.upsert({
  where: { email },
  update: { role: "ADMIN", passwordHash },
  create: { email, name: "Admin", role: "ADMIN", passwordHash },
});

console.log("✅ Admin ready:", email);
await prisma.$disconnect();
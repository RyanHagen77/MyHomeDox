-- DropIndex
DROP INDEX "public"."Home_city_state_idx";

-- DropIndex
DROP INDEX "public"."Home_ownerId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastHomeId" TEXT;

-- CreateIndex
CREATE INDEX "User_lastHomeId_idx" ON "User"("lastHomeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lastHomeId_fkey" FOREIGN KEY ("lastHomeId") REFERENCES "Home"("id") ON DELETE SET NULL ON UPDATE CASCADE;

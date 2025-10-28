/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Home` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Home` table. All the data in the column will be lost.
  - The `photos` column on the `Home` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `HomeAccess` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `HomeAccess` table. All the data in the column will be lost.
  - Made the column `city` on table `Home` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Home` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zip` on table `Home` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `role` to the `HomeAccess` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."HomeAccess" DROP CONSTRAINT "HomeAccess_homeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HomeAccess" DROP CONSTRAINT "HomeAccess_userId_fkey";

-- DropIndex
DROP INDEX "public"."Home_city_state_zip_idx";

-- DropIndex
DROP INDEX "public"."HomeAccess_homeId_level_idx";

-- AlterTable
ALTER TABLE "Home" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "meta" JSONB,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zip" SET NOT NULL,
DROP COLUMN "photos",
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "HomeAccess" DROP COLUMN "createdAt",
DROP COLUMN "level",
ADD COLUMN     "migratedAt" TIMESTAMP(3),
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "kind" TEXT,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "provider" TEXT,
    "policyNo" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Record_homeId_date_idx" ON "Record"("homeId", "date");

-- CreateIndex
CREATE INDEX "Record_createdBy_idx" ON "Record"("createdBy");

-- CreateIndex
CREATE INDEX "Reminder_homeId_dueAt_idx" ON "Reminder"("homeId", "dueAt");

-- CreateIndex
CREATE INDEX "Reminder_createdBy_idx" ON "Reminder"("createdBy");

-- CreateIndex
CREATE INDEX "Warranty_homeId_expiresAt_idx" ON "Warranty"("homeId", "expiresAt");

-- CreateIndex
CREATE INDEX "Home_city_state_idx" ON "Home"("city", "state");

-- CreateIndex
CREATE INDEX "HomeAccess_homeId_idx" ON "HomeAccess"("homeId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeAccess" ADD CONSTRAINT "HomeAccess_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeAccess" ADD CONSTRAINT "HomeAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ProStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProType" AS ENUM ('REALTOR', 'INSPECTOR', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('VIEW', 'COMMENT', 'EDIT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "proStatus" "ProStatus";

-- CreateTable
CREATE TABLE "ProProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ProType" NOT NULL,
    "company" TEXT,
    "licenseNo" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeAccess" (
    "id" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "AccessLevel" NOT NULL DEFAULT 'VIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProProfile_userId_key" ON "ProProfile"("userId");

-- CreateIndex
CREATE INDEX "HomeAccess_userId_idx" ON "HomeAccess"("userId");

-- CreateIndex
CREATE INDEX "HomeAccess_homeId_level_idx" ON "HomeAccess"("homeId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "HomeAccess_homeId_userId_key" ON "HomeAccess"("homeId", "userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Home_ownerId_idx" ON "Home"("ownerId");

-- CreateIndex
CREATE INDEX "Home_city_state_zip_idx" ON "Home"("city", "state", "zip");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_proStatus_idx" ON "User"("proStatus");

-- AddForeignKey
ALTER TABLE "ProProfile" ADD CONSTRAINT "ProProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeAccess" ADD CONSTRAINT "HomeAccess_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeAccess" ADD CONSTRAINT "HomeAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

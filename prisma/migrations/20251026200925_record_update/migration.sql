/*
  Warnings:

  - You are about to drop the column `verified` on the `Record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "verified",
ALTER COLUMN "cost" SET DATA TYPE DOUBLE PRECISION;

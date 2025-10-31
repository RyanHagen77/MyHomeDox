-- CreateEnum
CREATE TYPE "AttachmentVisibility" AS ENUM ('OWNER', 'HOME', 'PUBLIC');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reminderId" TEXT,
ADD COLUMN     "visibility" "AttachmentVisibility" NOT NULL DEFAULT 'OWNER',
ADD COLUMN     "warrantyId" TEXT;

-- AlterTable
ALTER TABLE "Warranty" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_reminderId_idx" ON "Attachment"("reminderId");

-- CreateIndex
CREATE INDEX "Attachment_warrantyId_idx" ON "Attachment"("warrantyId");

-- CreateIndex
CREATE INDEX "Warranty_createdBy_idx" ON "Warranty"("createdBy");

-- CreateIndex
CREATE INDEX "Warranty_verifiedBy_idx" ON "Warranty"("verifiedBy");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_warrantyId_fkey" FOREIGN KEY ("warrantyId") REFERENCES "Warranty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

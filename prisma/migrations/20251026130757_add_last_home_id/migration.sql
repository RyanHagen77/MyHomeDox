-- CreateIndex
CREATE INDEX "Home_ownerId_idx" ON "Home"("ownerId");

-- CreateIndex
CREATE INDEX "Home_city_state_idx" ON "Home"("city", "state");

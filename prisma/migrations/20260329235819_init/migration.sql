-- CreateTable
CREATE TABLE "GameConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameConfig_key_key" ON "GameConfig"("key");

-- CreateIndex
CREATE INDEX "GameConfig_key_idx" ON "GameConfig"("key");

-- CreateIndex
CREATE INDEX "GameConfig_category_idx" ON "GameConfig"("category");

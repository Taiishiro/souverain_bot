-- AlterTable
ALTER TABLE "Royaume" ADD COLUMN     "role_discord_id" TEXT,
ALTER COLUMN "salons_json" SET DEFAULT '{"palais": "", "place-publique": "", "caserne": "", "cachot": ""}';

-- CreateTable
CREATE TABLE "Emprisonnement" (
    "id" TEXT NOT NULL,
    "prisonnier_id" TEXT NOT NULL,
    "royaume_id" TEXT NOT NULL,
    "raison" TEXT,
    "vocal_id" TEXT NOT NULL,
    "libere_a" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Emprisonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooldownPersistent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "available_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CooldownPersistent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Emprisonnement_prisonnier_id_idx" ON "Emprisonnement"("prisonnier_id");

-- CreateIndex
CREATE INDEX "Emprisonnement_royaume_id_idx" ON "Emprisonnement"("royaume_id");

-- CreateIndex
CREATE INDEX "Emprisonnement_libere_a_idx" ON "Emprisonnement"("libere_a");

-- CreateIndex
CREATE INDEX "CooldownPersistent_user_id_idx" ON "CooldownPersistent"("user_id");

-- CreateIndex
CREATE INDEX "CooldownPersistent_action_type_idx" ON "CooldownPersistent"("action_type");

-- CreateIndex
CREATE INDEX "CooldownPersistent_available_at_idx" ON "CooldownPersistent"("available_at");

-- CreateIndex
CREATE UNIQUE INDEX "CooldownPersistent_user_id_action_type_key" ON "CooldownPersistent"("user_id", "action_type");

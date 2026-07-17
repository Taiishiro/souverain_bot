-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "argent_perso" BIGINT NOT NULL DEFAULT 0,
    "inventaire" JSONB NOT NULL DEFAULT '{}',
    "famille_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Famille" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "chef_id" TEXT NOT NULL,
    "argent_commun" BIGINT NOT NULL DEFAULT 0,
    "inventaire_commun" JSONB NOT NULL DEFAULT '{}',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Famille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dragon" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Feu',
    "tiers" TEXT NOT NULL DEFAULT 'T1',
    "niveau" INTEGER NOT NULL DEFAULT 1,
    "experience" BIGINT NOT NULL DEFAULT 0,
    "puissance" INTEGER NOT NULL DEFAULT 10,
    "faim" INTEGER NOT NULL DEFAULT 100,
    "energie_combat" INTEGER NOT NULL DEFAULT 100,
    "etat" TEXT NOT NULL DEFAULT 'Vivant',
    "age_en_jours" INTEGER NOT NULL DEFAULT 0,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dragon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Royaume" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "puissance" BIGINT NOT NULL DEFAULT 0,
    "categorie_discord_id" TEXT NOT NULL DEFAULT '',
    "salons_json" JSONB NOT NULL DEFAULT '{}',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Royaume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prix" BIGINT NOT NULL,
    "effet_json" JSONB NOT NULL DEFAULT '{}',
    "stock" INTEGER NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alliance" (
    "id" TEXT NOT NULL,
    "royaume_a_id" TEXT NOT NULL,
    "royaume_b_id" TEXT NOT NULL,
    "pacte_json" JSONB NOT NULL DEFAULT '{}',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooldown" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cooldown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pari" (
    "id" TEXT NOT NULL,
    "createur_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mises_json" JSONB NOT NULL DEFAULT '{}',
    "cote" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "resultat" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "tax_percentage" INTEGER NOT NULL DEFAULT 5,
    "toggle_faim_enabled" BOOLEAN NOT NULL DEFAULT true,
    "prix_multiplicateur" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "cooldown_perquisition" INTEGER NOT NULL DEFAULT 24,
    "daily_amount" BIGINT NOT NULL DEFAULT 1000,
    "daily_cooldown" INTEGER NOT NULL DEFAULT 24,
    "canal_logs_id" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE INDEX "User_famille_id_idx" ON "User"("famille_id");

-- CreateIndex
CREATE INDEX "User_discordId_idx" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Famille_nom_key" ON "Famille"("nom");

-- CreateIndex
CREATE INDEX "Famille_chef_id_idx" ON "Famille"("chef_id");

-- CreateIndex
CREATE INDEX "Dragon_owner_id_idx" ON "Dragon"("owner_id");

-- CreateIndex
CREATE INDEX "Dragon_etat_idx" ON "Dragon"("etat");

-- CreateIndex
CREATE UNIQUE INDEX "Royaume_nom_key" ON "Royaume"("nom");

-- CreateIndex
CREATE INDEX "Royaume_owner_id_idx" ON "Royaume"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_nom_key" ON "ShopItem"("nom");

-- CreateIndex
CREATE INDEX "ShopItem_type_idx" ON "ShopItem"("type");

-- CreateIndex
CREATE INDEX "Alliance_royaume_a_id_idx" ON "Alliance"("royaume_a_id");

-- CreateIndex
CREATE INDEX "Alliance_royaume_b_id_idx" ON "Alliance"("royaume_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "Alliance_royaume_a_id_royaume_b_id_key" ON "Alliance"("royaume_a_id", "royaume_b_id");

-- CreateIndex
CREATE INDEX "Cooldown_user_id_action_idx" ON "Cooldown"("user_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Cooldown_user_id_action_key" ON "Cooldown"("user_id", "action");

-- CreateIndex
CREATE INDEX "Pari_createur_id_idx" ON "Pari"("createur_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_famille_id_fkey" FOREIGN KEY ("famille_id") REFERENCES "Famille"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dragon" ADD CONSTRAINT "Dragon_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Royaume" ADD CONSTRAINT "Royaume_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

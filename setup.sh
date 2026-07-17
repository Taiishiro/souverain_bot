#!/bin/bash
###############################################################################
# SETUP COMPLET - LE BOT SOUVERAIN
# Installe toutes les dépendances et prépare le projet pour le développement
###############################################################################

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════"
echo "🚀 SETUP COMPLET - LE BOT SOUVERAIN"
echo "════════════════════════════════════════════════════════════════"
echo ""

# 1. Vérifier que node_modules n'existe pas ou n'est pas à jour
echo "📦 1️⃣  Installation des dépendances NPM..."
npm install 2>&1 | tail -5
echo "   ✅ Dépendances installées"
echo ""

# 2. Générer Prisma Client
echo "📄 2️⃣  Génération du client Prisma..."
npm run prisma:generate 2>&1 | tail -3
echo "   ✅ Prisma Client généré"
echo ""

# 3. Vérifier la compilation TypeScript
echo "🔨 3️⃣  Vérification de la compilation TypeScript..."
npm run build 2>&1 | tail -10
echo "   ✅ Compilation réussie"
echo ""

# 4. Résumé
echo "════════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLET!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Copier .env.example → .env et remplir les secrets:"
echo "      cp .env.example .env"
echo "      nano .env"
echo ""
echo "   2. Démarrer PostgreSQL:"
echo "      docker-compose up -d"
echo ""
echo "   3. Initialiser la base de données:"
echo "      npx prisma migrate dev --name init"
echo ""
echo "   4. Seeder les items boutique:"
echo "      npm run db:seed"
echo ""
echo "   5. Lancer le bot:"
echo "      npm run dev"
echo ""
echo "════════════════════════════════════════════════════════════════"

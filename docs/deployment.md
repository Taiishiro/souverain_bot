# 📋 INSTRUCTIONS DE DÉPLOIEMENT - Le Bot Souverain

## ✅ Étapes de Configuration

### 1️⃣ Obtenir le Token Discord
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Allez dans "Bot" → "Add Bot"
4. Copiez le token sous "TOKEN"
5. Activez les "Privileged Gateway Intents": 
   - `PRESENCE INTENT`
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`

### 2️⃣ Inviter le Bot sur un Serveur de Test
1. Allez dans "OAuth2" → "URL Generator"
2. Sélectionnez les scopes: `bot`
3. Sélectionnez les permissions:
   - `Send Messages`
   - `Use Slash Commands`
   - `Read Message History`
4. Copiez l'URL et ouvrez-la dans votre navigateur

### 3️⃣ Configuration Locale

Remplir le fichier `.env`:
```bash
cp .env.example .env
```

Éditer `.env`:
```env
DISCORD_TOKEN=votre_token_ici
DISCORD_CLIENT_ID=votre_client_id
DISCORD_SERVER_ID=votre_server_id_ici
DATABASE_URL=postgresql://souverain:souverain_password@localhost:5432/souverain_db
NODE_ENV=development
```

### 4️⃣ Démarrer PostgreSQL via Docker

```bash
docker-compose up -d
```

Vérifier:
```bash
docker ps # Doit afficher "souverain_postgres"
```

### 5️⃣ Installer les dépendances

```bash
npm install
```

### 6️⃣ Initialiser la base de données

```bash
npx prisma migrate dev --name init
npx prisma db push
```

### 7️⃣ Seed de la boutique (Items par défaut)

```bash
npm run db:seed
```

### 8️⃣ Démarrer le bot

```bash
npm run dev
```

Le bot devrait afficher:
```
👑 Bot prêt! Connecté en tant que SouverainBot#0000
✅ {{ nombre }} commandes disponibles
🕐 Initialisation des cron jobs...
✅ Cron jobs initialisés
```

## 🧪 Tester les Commandes

### Économie (Sprint 2)
```
/daily → Récupérer 1000$
/argent → Afficher solde
/payer @user 100 → Payer un utilisateur (taxe 5%)
/boutique → Voir les items
/acheter Jeune Dragon T1 → Acheter un item
/inventaire → Afficher inventaire
/topargent → Top 10 des riches
```

### Dragons (Sprint 4)
```
/dragon liste → Afficher vos dragons
/nourrir 1 → Nourrir le dragon 1 (100$)
/soindragon 1 → Soigner le dragon 1
/revivre 1 → Ressusciter dragon 1 (utilise Incubateur)
```

### Famille (Sprint 3)
```
/marier @user → Se marier (crée une famille)
/famille info → Infos de la famille
/famille nom "Nouveau Nom" → Renommer la famille
```

## 🐛 Troubleshooting

### Bot ne se connecte pas
```bash
# Vérifier le token dans .env
echo $DISCORD_TOKEN

# Vérifier les permissions
# Le bot doit avoir les scopes: bot, Send Messages, Use Slash Commands
```

### Erreur de base de données
```bash
# Vérifier la connexion PostgreSQL
docker logs souverain_postgres

# Réinitialiser la DB
npx prisma migrate reset --force
npx prisma db push
npm run db:seed
```

### Commandes non enregistrées
```bash
# Attendre 1 heure pour que Discord mette à jour
# Ou relancer le bot en dev mode après avoir modifié DISCORD_SERVER_ID
npm run dev
```

## 📊 Suivre l'Évolution

### Voir les données en direct
```bash
npm run prisma:studio
```

Ouvre une interface web pour explorer la BD.

### Logs détaillés
```bash
# En développement, les logs Prisma sont affichés
NODE_ENV=development npm run dev
```

## 🚀 Déploiement en Production

1. Changer `NODE_ENV=production` dans `.env`
2. Ajouter un token bot PRODUCTION
3. Compiler: `npm run build`
4. Démarrer: `npm start`

## 📝 Prochaines étapes

Après vérification, implémentez:
- [ ] Sprint 5 (Combat & Guerre) - Commandes `/attaque`, `/sabotage`, `/perquisition`
- [ ] Sprint 6 (Diplomatie & Paris) - Commandes `/alliance`, `/pari`
- [ ] Finalisations et optimisations

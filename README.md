# 🐉 Le Bot Souverain

Un RPG multijoueur qui vit **entièrement dans Discord** : économie, dragons,
royaumes, mariages, prisons et guerres entre alliances.

Pas de client à installer, pas de site à ouvrir. Un serveur Discord devient une
carte politique où une trentaine de commandes suffisent à bâtir un royaume,
élever un dragon, se marier, trahir, envahir — ou finir en prison.

> Bot personnel écrit pour un serveur communautaire. Le code est public ; les
> équilibrages (prix, dégâts, cooldowns) sont taillés pour ce serveur-là.

## Ce qu'on peut faire

| Domaine | Commandes | En quelques mots |
|---|---|---|
| 💰 **Économie** | `/daily` `/argent` `/payer` `/boutique` `/acheter` `/inventaire` `/topargent` | Revenu quotidien, boutique persistée en base, transferts entre joueurs, classement |
| 🐉 **Dragons** | `/dragons` `/nourrir` `/soindragon` `/nommerdragon` `/sabotage` | Créatures à faire vivre : faim, PV, énergie de combat, tiers — et sabotables par un rival |
| 🏰 **Royaumes** | `/royaume` `/garnison_depot` `/garnison_retrait` `/deposer_or` `/retirer_or` | Territoires, trésor commun, garnison |
| ⚔️ **Guerre** | `/attaque` `/puissance` `/revivre` | Les dragons se battent, et peuvent en mourir |
| 🤝 **Diplomatie** | `/alliance` | Alliances entre joueurs, rôles Discord synchronisés |
| 💍 **Famille** | `/marier` `/divorce` `/famille` | Mariages, familles, divorces (avec conséquences) |
| ⛓️ **Justice** | `/emprisonner` `/liberer` `/purge` | Prison réelle : le joueur est isolé par permissions Discord |
| 🛠️ **Admin** | `/setup` `/setup-admin` `/config` `/admin-give-money` `/admin-give-item` `/admin-remove-money` `/admin-remove-item` | Installation du serveur, réglages en base, corrections |
| 🖼️ **Divers** | `/profil` `/argentimg` `/regles` | Profil et carte d'argent rendus en **image** |

## Comment c'est fait

```
Discord  ──►  events/interactionHandler  ──►  commands/*.ts
                                                  │
                                                  ▼
                                            features/*  (la règle du jeu)
                                                  │
                                                  ▼
                                            Prisma  ──►  PostgreSQL
                                                  ▲
                                            cronjobs/  (faim, revenus, cooldowns)
```

| Dossier | Rôle |
|---|---|
| `src/commands/` | Une slash command = un fichier (33 commandes) |
| `src/events/` | Réception des interactions Discord, routage vers les handlers |
| `src/features/` | La logique métier, isolée par domaine : `combat`, `economy`, `dragons`, `royaumes`, `diplomatie` |
| `src/cronjobs/` | Le monde qui tourne sans personne : faim des dragons, revenus, expirations |
| `src/utils/` | Rendu d'images, accès joueur, permissions |
| `src/db/` | Client Prisma |
| `prisma/` | Schéma (12 modèles), migrations, seed de la boutique |

**Pourquoi PostgreSQL et pas un fichier JSON** : l'or, les items et les dragons
sont disputés entre joueurs. Deux `/payer` simultanés sur le même solde doivent
être une transaction, pas une course. Prisma apporte les migrations et les
transactions ; et le modèle `CooldownPersistent` survit à un redémarrage — sans
lui, un joueur remettrait ses compteurs à zéro en attendant que le bot tombe.

## Quelques détails qui ont demandé du travail

- **La prison est réelle.** `/emprisonner` ne pose pas un booléen en base : le bot
  réécrit les `permissionOverwrites` Discord du joueur pour l'isoler vraiment,
  puis les restaure à la libération.
- **Les images sont générées à la volée.** `/profil` et `/argentimg` composent du
  HTML rendu en PNG par Puppeteer (`src/utils/renderProfileImage.ts`) — un
  navigateur headless tourne donc à côté du bot.
- **Attaquer engage tes dragons, pas ton personnage.** Il faut un dragon vivant
  avec au moins 50 d'énergie de combat ; les dragons de l'alliance du défenseur
  viennent le protéger ; un siège donne +20 % au défenseur. Les dragons tués le
  restent (jusqu'à `/revivre`).
- **Les cooldowns sont en base** (`CooldownPersistent`), jamais en mémoire.

## Installation

Prérequis : **Node 20+**, **Docker** (pour PostgreSQL), et une
[application Discord](https://discord.com/developers/applications).

```bash
git clone https://github.com/Taiishiro/souverain_bot.git
cd souverain_bot
npm install

cp .env.example .env         # remplis DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_SERVER_ID
docker compose up -d         # PostgreSQL

npx prisma migrate deploy    # crée les tables
npm run db:seed              # remplit la boutique

npm run dev                  # démarre le bot
```

Puis, sur le serveur Discord : `/setup` crée les salons et rôles nécessaires.

> ⚠️ Ton `.env` contient le **token du bot**. Quiconque l'obtient contrôle le bot.
> Il est déjà dans `.gitignore` — garde-le comme ça.

### Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Démarre en TypeScript direct (ts-node) |
| `npm run dev:watch` | Idem, avec redémarrage à chaque sauvegarde |
| `npm run build` | Compile vers `dist/` |
| `npm start` | Lance la version compilée (production) |
| `npm run prisma:studio` | Ouvre l'explorateur de base |
| `npm run db:seed` | (Re)remplit la boutique |

### Production

`docker-compose.yml` monte la base ; `ecosystem.config.js` fait tourner le bot
sous **pm2** (redémarrage auto). Le `Dockerfile` construit l'image du bot.

## État du projet

Fonctionnel et joué. Ce dépôt est publié pour montrer le code, pas comme un
produit clé en main : l'équilibrage est taillé pour un serveur précis, et il n'y a
pas encore de tests automatisés — la prochaine dette à rembourser.

## Licence

[MIT](LICENSE) — sers-toi, forke, adapte à ton serveur.

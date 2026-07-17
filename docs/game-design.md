# 🏰 LE BOT SOUVERAIN - Grimoire du Royaume Éternel

> **Bot Discord RPG Sombre** avec économie médiévale-fantastique, créatures spectrales, royaumes maudits, unions charnelles et système de combat PvP impitoyable.

## 📊 **Aperçu du Projet**

- **Langage** : TypeScript/Node.js 20.x
- **Framework** : Discord.js v14
- **Base de données** : PostgreSQL + Prisma ORM
- **Infrastructure** : Docker Compose
- **Lignes de code** : ~5000+
- **Fichiers** : 45+ fichiers TypeScript
- **Commandes** : 28+ slash commands
- **Modèles DB** : 13 tables Prisma
- **Rendu Image** : Puppeteer (Chrome headless int00e9gr00e9) - Remplacement complet des Embeds textuels par des images g00e9n00e9r00e9es via HTML/CSS (Dark Fantasy style)
- **Rendu Image** : Puppeteer (Chrome headless int00e9gr00e9) - Remplacement complet des Embeds textuels par des images g00e9n00e9r00e9es via HTML/CSS (Dark Fantasy style)

---

## 🎯 **Fonctionnalités Principales**

### 💰 **Système Économique - Les Sceaux Royaux**
- **Monnaie unique** : 💰 (BigInt pour immenses fortunes)
- **Obole Quotidienne** : `/daily` (+1000💰)
- **Tributs Royaux** : `/payer` avec taxe seigneuriale (5%) et sceau de raison
- **Échoppe de l'Alchimiste** : `/boutique` avec achats d'**artefacts**, **dragons T1/T2/T3**, **royaumes frontaliers/principaux**, **Puînés** (infanterie, puissance 1, prix configurable)
  - **Dragons** : Créés directement en base de données (T1: 50k, T2: 250k, T3: 1M)
  - **Royaumes** : Création avec categoria Discord + 4 salons automatiques (Frontalier: 500k, Principal: 1.5M)
- **Registre de Richesse** : `/argent` et `/topargent` - Rendu image horizontal avec avatar, barre, classement
- **Grâce Royale** : Admins/Propriétaires exemptés de taxes

### 🐉 **Système de Créatures Spectrales - Dragons & Squelettes**
- **3 Tiers de Puissance** : T1 (Jeune), T2 (Adulte), T3 (Ancien)
- **États de Vie** : 
  - ✅ **Vivant** : Combat, faim, énergie
  - ⚰️ **Squelette** : Dragon mort mais non ressuscité (stats gelées, pas de combat)
  - 🔥 **Incinéré** : Destruction permanente lors divorce/sabotage critique
- **Stats Essentielles** : Faim (0-100), Énergie Combat (0-100), Niveau, Puissance
- **Actions Mortelles** : Nourrir, Soigner, ou Réanimer (avec Incubateur sacré)
- **Nommage Customisé** : `/nommerdragon` permet de baptiser ses dragons via un menu dynamique.
- **Nommage Customisé** : `/nommerdragon` permet de baptiser ses dragons via un menu dynamique.
- **Combat Spectral** : Utilisés dans batailles PvP (morts ne combattent pas)
- **Prérequis Royaumes** : 3 dragons T2+ **VIVANTS** requis

### 👑 **Système de Royaumes Maudits**
- **Achat d'une Couronne** : `/royaume acheter "nom"` (50,000💰)
- **Création Discord Automatique** : 
  - Catégorie nommée "[Royaume]"
  - Salons : `#palais` (annonces), `#place-publique` (commerce), `#caserne` (armes), `#cachot` (prisonniers)
- **Permissions de Fer** : Souverain = tous droits, Alliés = salons limités, Autres = bannisseurs
- **Rôle Seigneurial** : Attribution auto "Souverain de [nom]" au propriétaire
- **Gestion Territoire** : Permissions Discord gérées en temps réel par Prisma
- **Puissance du Royaume** : Additionne la puissance des dragons vivants **et** des Puînés possédés (1 pt par Puîné)

### 🤝 **Système d'Alliances - Le Pacte de Sang**
- **Regroupement Massif** : Fusionne plusieurs Familles et/ou Joueurs individuels sous une même bannière.
- **Trésorerie & Arsenal Partagés** : `argent_commun` et `inventaire_commun` gérés à l'échelle de l'alliance.
- **Garnison de Dragons** : Tous les membres peuvent déposer leurs dragons en garnison (soin partagé). **Cependant**, seul le propriétaire originel (`owner_id`) d'un dragon possède l'autorisation de le retirer de l'alliance.
- **Défense Automatisée** : En cas d'attaque PvP, l'attaqué prend les dégâts en priorité, puis **les forces unifiées de l'alliance ripostent automatiquement** de concert.

### 🤝 **Système d'Alliances - Le Pacte de Sang**
- **Regroupement Massif** : Fusionne plusieurs Familles et/ou Joueurs individuels sous une même bannière.
- **Trésorerie & Arsenal Partagés** : `argent_commun` et `inventaire_commun` gérés à l'échelle de l'alliance.
- **Garnison de Dragons** : Tous les membres peuvent déposer leurs dragons en garnison (soin partagé). **Cependant**, seul le propriétaire originel (`owner_id`) d'un dragon possède l'autorisation de le retirer de l'alliance.
- **Défense Automatisée** : En cas d'attaque PvP, l'attaqué prend les dégâts en priorité, puis **les forces unifiées de l'alliance ripostent automatiquement** de concert.

### 👨‍👩‍👧‍👦 **Système Matrimonial - L'Union Charnelle**
- **Mariage Fusionnel** : `/marier` = FUSION TOTALE des comptes en DB
  - Les deux joueurs partagent UN SEUL compte 💰 (argent_commun)
  - Les dragons restent liés au propriétaire originel
  - Séparation de propriété = instabilité accrue
- **Divorce Destructif** : `/divorce` = PERTE CATASTROPHIQUE
  - 50% de la **fortune COMMUNE** est INCINÉRÉE par le Feu Royal (perte nette)
  - Les 50% restants sont split 50/50 entre les conjoints
  - Les dragons reviennent à leurs propriétaires originels
  - **Exemple** : Couple avec 1000💰. Divorce = 500💰 brûlés, 250💰 chacun
- **Gestion Commune** : Renommage famille, infos partagées

### ⚔️ **Système de Combat & Persécution**
- **Attaques Directes Séquentielles** : `/attaque @user` (Animations de combat en 3 phases, affichage de l'Écart de Puissance)
  - **Système RNG (70/30)** : Issue probabiliste basée sur les puissances des armées.
  - **Miracle (5%)** : Chance pour l'armée la plus faible de doubler sa puissance in extremis.
  - **Conséquences Sanglantes** : Sur une défaite grave (ratio <= 0.5), l'armée vaincue perd 50% de ses dragons (transformés en **Squelette**).
  - **Rapport de Bataille (Images)** : Génération d'un visuel HTML exclusif via Puppeteer détaillant les victimes, le vainqueur et les vols d'or.
- **Sabotage de Créatures** : `/sabotage @user` (tue dragons, les rend Squelettes)
- **Perquisition Royale** : `/perquisition @user` (vol argent/artefacts)
- **Mandat d'Arrêt** : `/emprisonner @user` (Souverain seulement)
  - Déplace la victime en vocal `#cachot` du Royaume
  - Mute automatique via bot Discord
  - Durée : 1h ou libération par le Souverain
  - Peut piller impunément durant l'emprisonnement
- **Cooldowns Persistants** : Gestion stricte des cooldowns en base de données.
- **Élixir de Combat** : Objet de la Boutique permettant de réinitialiser instantanément le cooldown d'attaque via l'inventaire dynamique.

### 🔧 **Système d'Administration - Ordonnances Royales**
- **Configuration Admin** : `/setup-admin @role` (Propriétaire serveur seulement)
- **Gestion Ordonnances** : `/config toggle/list`
- **Désactivation Pouvoirs** : Échoppe, Dragons, Royaumes, Familles, Combat, etc.
- **Commandes de Pouvoir** : Give money/items, remove items, emprisonment
- **Initialisation** : `/setup` (distribution monnaie initiale)

---

## 🏗️ **Architecture Technique**

### 📁 **Structure des Fichiers**
```
src/
├── commands/          # 23+ slash commands
│   ├── argent.ts
│   ├── payer.ts
│   ├── boutique.ts
│   ├── dragon.ts
│   ├── royaume.ts
│   ├── config.ts      # Gestion configs
│   └── ...
├── events/            # Event handlers Discord
│   ├── ready.ts
│   └── interactionHandler.ts
├── features/          # Logique métier
│   ├── economy/
│   ├── dragons/
│   ├── royaumes/
│   └── combat/
├── utils/             # Utilitaires
│   ├── embeds.ts      # Embeds stylisés
│   ├── gameConfig.ts  # Configs DB
│   ├── initConfig.ts  # Init configs
│   ├── getUserData.ts
│   └── cooldown.ts
├── db/
│   └── prisma.ts      # Singleton Prisma
├── cronjobs/          # Tâches planifiées
└── main.ts            # Point d'entrée

prisma/
├── schema.prisma      # 11 modèles DB
├── seed.ts           # Données initiales
└── migrations/       # Migrations DB
```

### 🗄️ **Modèles de Base de Données - Schéma des Âmes**
```prisma
// Utilisateurs & Familles (Union Totale)
model User {
  id            String    @id @default(cuid())
  discordId     String    @unique
  argent_perso  BigInt    @default(0)           // Argent personnel
  inventaire    Json      @default("{}")        // Artefacts
  famille_id    String?
  dragons       Dragon[]
  royaumes_owns Royaume[]
  alliance_id   String?
  alliance_id   String?
}

model Famille {
  id                String    @id @default(cuid())
  nom               String    @unique
  chef_id           String
  argent_commun     BigInt    @default(0)      // FUSION! Compte commun partagé
  membres           User[]
  alliance_id       String?
  createdAt         DateTime  @default(now())
}

// Dragons & Créatures Spectrales
model Dragon {
  id                String    @id @default(cuid())
  owner_id          String
  nom               String?              // Nom customisé par le joueur
  nom               String?              // Nom customisé par le joueur
  type              String    @default("Feu")
  tiers             String    @default("T1")   // T1, T2, T3
  niveau            Int       @default(1)
  puissance         Int       @default(10)     // Base * Tiers
  faim              Int       @default(100)
  energie_combat    Int       @default(100)
  etat              String    @default("Vivant") // Vivant, Squelette, Incinéré
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  alliance_id       String?
}

// Alliances (Garnison & Trésor)
model Alliance {
  id                String    @id @default(cuid())
  nom               String    @unique
  chef_id           String
  inventaire_commun Json      @default("{}")
  argent_commun     BigInt    @default(0)
  membres_users     User[]
  membres_familles  Famille[]
  dragons           Dragon[]
  createdAt         DateTime  @default(now())
}

// Royaumes avec Gestion Discord
model Royaume {
  id                  String    @id @default(cuid())
  nom                 String    @unique
  owner_id            String
  puissance           BigInt    @default(0)
  categorie_discord_id String  @unique         // ID de la catégorie Discord
  salons_json         Json      @default("{\"palais\": \"\", \"place-publique\": \"\", \"caserne\": \"\", \"cachot\": \"\"}") // IDs des salons
  role_discord_id     String?   @unique        // Rôle "Souverain de [nom]"
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

// Emprisonnement (Mandat d'Arrêt)
model Emprisonnement {
  id                String    @id @default(cuid())
  prisonnier_id     String
  royaume_id        String
  raison            String?
  vocal_id          String    // ID du salon #cachot
  libere_a          DateTime  // Heure de libération automatique
  createdAt         DateTime  @default(now())
}

// Cooldowns Persistants (Survit aux Redémarrages!)
model CooldownPersistent {
  id                String    @id @default(cuid())
  user_id           String
  action_type       String    // attaque, sabotage, perquisition, emprisonnement
  available_at      DateTime  // Quand l'action sera redisponible
  unique([user_id, action_type])
}

// Boutique - Échoppe de l'Alchimiste
model ShopItem {
  id                String    @id @default(cuid())
  nom               String    @unique
  type              String    // dragon, soin, incubateur, artefact
  prix              BigInt
  description       String?
  effet_json        Json      @default("{}")
  stock             Int       @default(-1)    // -1 = infini
  createdAt         DateTime  @default(now())
}

// Configuration du Jeu - Ordonnances Royales
model GameConfig {
  id            String    @id @default(cuid())
  key           String    @unique
  value         String
  description   String?
  category      String    @default("general")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

---

## 📋 **IMPORTANT - MISE À JOUR DOCUMENTATION & CODE**
**Chaque modification du code doit être reflétée dans ce document !**

**Quand modifier PROJECT_CONTEXT.md :**
- ✅ Ajout/modification/suppression de commandes
- ✅ Changement de fonctionnalités ou mécaniques
- ✅ Modification des permissions ou rôles
- ✅ Ajout de nouvelles tables/models DB
- ✅ Changement d'interface utilisateur (embeds, messages, couleurs)
- ✅ Modification des formules de calcul (combat, économie, mariage, etc.)
- ✅ Ajout de nouvelles dépendances ou configurations

**MODIFICATIONS MAJEURES (30/03/2026) :**
- ✅ **Refonte Dark Fantasy Complète** : Remplacement Cyber-Médiéval → Médiéval-Fantastique Sombre
- ✅ **Système de Squelettes** : Dragons morts → État Squelette inerte (nécessite Incubateur pour réanimer)
- ✅ **Divorce Destructeur** : 50% incinérés + 50% split (perte nette) au lieu de simple split
- ✅ **Mariage Fusionnel** : 1 compte argent_commun pour 2 joueurs (vrai gameplay impact)
- ✅ **Royaumes + Discord Automation** : Création auto catégorie + 4 salons (#palais, #place-publique, #caserne, #cachot)
- ✅ **Emprisonnement Fonctionnel** : Mandat d'arrêt déplace en #cachot + mute 1h
- ✅ **Cooldowns en DB** : Table `CooldownPersistent` pour survie redémarrages
- ✅ **Palette Dark Fantasy** : Gris Tombeau (#424242), Or Terni (#B8860B), Sang Séché (#8B0000), Vert Mousse (#006400), Noir Abyssal (#000000)
- ✅ **Terminologie Archaïque** : Sceau Royal, Obole, Échoppe, Artefacts, Ordonnances, Grâce Royale
- ✅ **ASCII Gothique** : Séparateurs et structuration visuelle Dark Fantasy
- ✅ **Emojis Cohérents** : 🐉→Vivant, ☠️🐉→Squelette, 🔥→Destruction, 🔮→Magie
- ✅ **Node.js 20.x** : Spécifié comme runtime cible

**MODIFICATIONS 31/03/2026 :**
- ✅ **Image Rendering** : `/argent` affiche une image PNG (avatar + barre + classement + record) au lieu d'embed
- ✅ **Dragons en Boutique** : Achat T1/T2/T3 (Feu/Glace/Foudre) crée directement en DB
- ✅ **Royaumes en Boutique** : Achat Frontalier/Principal crée territoire Discord complet
- ✅ **Items Initialisés** : ShopItems pré-remplis au démarrage du bot (via `initializeShopItems`)
- ✅ **Handler d'Achat Amélioré** : Support dragon/royaume/item, création auto avec stats de base
- ✅ **Nettoyage Logs** : Suppression des fichiers commentaires/exemples défaillants
- ✅ **Système d'Alliances (BDD)** : Refonte majeure du modèle Prisma. Introduction du modèle `Alliance` liant Familles, Joueurs et Dragons. Intégration de la trésorerie (`argent_commun`) et garnisons (`owner_id`).
- ✅ **Système d'Alliances (BDD)** : Refonte majeure du modèle Prisma. Introduction du modèle `Alliance` liant Familles, Joueurs et Dragons. Intégration de la trésorerie (`argent_commun`) et garnisons (`owner_id`).

---

## 🚀 **Installation & Configuration - Initiation au Grimoire**

### 📋 **Prérequis**
- Node.js **20.x** (obligatoire pour cooldowns persistants)
- Docker & Docker Compose
- PostgreSQL (via Docker)

### ⚙️ **Configuration Setup**

1. **Cloner & installer**
```bash
git clone <repo>
cd souverain_bot
npm install
```

2. **Variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec :
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_SERVER_ID=your_server_id
DATABASE_URL="postgresql://souverain:souverain_password@localhost:5433/souverain_db"
ADMIN_ROLE_ID=your_admin_role_id
NODE_ENV=development
```

3. **Base de données**
```bash
# Lancer PostgreSQL
docker-compose up -d

# Appliquer migrations (inclut CooldownPersistent, Emprisonnement, Dragon.etat)
npx prisma migrate dev --name init

# Seed données initiales
npm run db:seed
```

4. **Compiler & démarrer**
```bash
npm run build
npm start
```

---

## 🎮 **Commandes Disponibles - Livres de Lois**

### 💰 **L'Obole Quotidienne** (9 commandes)
- `/daily` - Réclamer la Tribut Quotidienne (+1000💰)
- `/argent` - Afficher son Registre de Fortune (IMAGE horizontale : avatar + barre + classement + record)
- `/topargent` - Les 10 Âmes les Plus Riches
- `/payer @user montant "raison"` - Sceau Royal entre Seigneurs (raison optionnelle, taxe 5%)
- `/boutique` - Consulter l'Échoppe de l'Alchimiste (boutons pour dragons, royaumes, artefacts)
- `/acheter artefact` - Acquérir un Artefact, un Dragon ou un **Puîné** (via boutons)
- `/inventaire` - Voir son Arsénal d'Artefacts
- `/config toggle/list` - Ordonnances Royales (admin uniquement)
- `/config-prix [item] [nouveau_prix]` - Modifier dynamiquement le prix d'un item (admin)

### 👨‍👩‍👧‍👦 **L'Union Charnelle** (4 commandes)
- `/marier @user` - Sceller l'Union (FUSION totale des comptes!)
- `/famille info` - Consulter la Maison Royale
- `/famille nom "nom"` - Renommer la Dynastie
- `/divorce` - Dissoudre l'Union (50% incinérés, 50% split!)

### 🐉 **Les Créatures Spectrales** (7 commandes)
- `/dragon liste` - Énumérer votre Ménagerie
- `/nommerdragon` - Baptiser un dragon
- `/nommerdragon` - Baptiser un dragon
- `/nourrir <index>` - Satisfaire la Faim (-100💰)
- `/soindragon <index>` - Restaurer Faim & Énergie (Artefacts)
- `/revivre <index>` - Réanimer un Squelette (Incubateur Sacré)
- `/attaque @user` - Lancer l'Assaut (vol 💰 + dégâts dragons PvP)
- `/sabotage @user` - Saboter une Créature Ennemie (la rend Squelette)
- `/dragon etat <index>` - Consulter état (Vivant/Squelette/Incinéré)

### 👑 **Les Royaumes Maudits** (4 commandes)
- `/royaume acheter "nom"` - Acquérir une Couronne (50k💰 + création salons Discord)
- `/royaume info` - Consulter l'Attrait du Trône
- `/emprisonner @user "raison"` - Mandat d'Arrêt (déplacement #cachot + mute 1h)
- `/liberer @user` - Souverain libère un Prisonnier

### ⚔️ **Système de Persécution** (3 commandes)
- `/attaque @user` - Lancer l'Assaut sur un Rival
- `/sabotage @user` - Tuer une Créature Ennemie (devient Squelette)
- `/perquisition @user` - Mandat de Fouille (vol 💰/Artefacts, cooldown 24h)

### 🔧 **Ordonnances Royales** (4 commandes - Admin)
- `/setup-admin @role` - Désigner le Rôle Admin (Propriétaire seulement)
- `/config toggle feature enabled` - Activer/Désactiver Pouvoirs
- `/config list` - Lister Toutes les Ordonnances
- `/setup` - Distribution Initiale de Fortune (admin)

---

## 🎨 **Design & UX - Esthétique du Grimoire Ancien**

### 🌈 **Palette Dark Fantasy - Codes Hex Précis**
Chaque embed Discord utilise une bordure selon le contexte immédiat :

| Contexte | Couleur | Code Hex | Ambiance |
|----------|---------|----------|----------|
| **Info/Général** | Gris Tombeau | `#424242` | Pierre froide, neutre, ancien |
| **Royauté/Prestige** | Or Terni | `#B8860B` | Richesse ancienne, couronne, pouvoir |
| **Danger/Combat** | Sang Séché | `#8B0000` | Attaque, dragons, mort, menace |
| **Succès/Soin** | Vert Mousse | `#006400` | Guérison, croissance, nature sombre |
| **Mort/Cooldown** | Noir Abyssal | `#000000` | Squelettes, néant, repos éternel |

### 📱 **Structure & Séparateurs - ASCII Gothique**
```
Séparateurs de section:    ──────────────────────────
Titres immersifs:          ▬▬▬▬▬▬ ⚔️ ▬▬▬▬▬▬  ou  ▬▬▬ 🔮 ▬▬▬
Listes:                    └> ou • ou †
Avertissements:            ⚠️ or ⚡
```

### 📜 **Terminologie Archaïque - Bans Stricts**
**À BANNIR** : Transaction, Daily, Shop, Items, Configuration, Bypass
**À UTILISER** : Sceau Royal, Obole Quotidienne, Échoppe de l'Alchimiste, Artefacts, Ordonnance Royale, Grâce Royale

**Transformations d'Exemples** :
- `/profil` : 👤 PROFIL → 🍷 REGISTRE DES ÂMES : [Nom]
- Succès paiement : 💸 Transaction → 📜 SCEAU ROYAL : Tribut de [X]💰 vers [Joueur]
- Boutique : Shop → Échoppe de l'Alchimiste
- Achat : Buy Item → Acquérir [Artefact]

### 🎭 **Emojis Thématiques - Cohérence Sombre**
- **Monnaie** : 💰 (ou 💀 pour monnaie d'âmes dans contexte sombre)
- **Dragons Vivants** : 🐉 
- **Dragons Squelettes** : ☠️🐉 ou 💀
- **Royaumes** : 🏰 ou 👑
- **Combat/Danger** : ⚔️ ou 🩸
- **Magie/Soin** : 🔮 ou 🍷
- **Mariage** : 💕 (union)
- **Divorce/Ruine** : 💔 ou 🔥 (destruction)
- **Prison** : 🔗 ou ⛓️
- **Artefacts** : 📿 ou 🔱

### 🎮 **Composants Interactifs - Codage Couleur Boutons Discord**

| Style Discord | Couleur | Usage Souverain | Labels Exemples |
|---|---|---|---|
| **Primary** | Bleu | Navigation, Infos | 🔍 Voir la Ménagerie, 📜 Consulter |
| **Success** | Vert | Gain, Achat, Validation | 💰 Acquérir le Dragon, 🔮 Signer le Pacte |
| **Danger** | Rouge | Irréversible (Combat, Divorce, Pillage) | 💀 Bannir le Conjoint, 🩸 Lancer l'Assaut |
| **Secondary** | Gris | Retour, Annulation, Cooldown | ❌ Refuser le Tribut |

### 🔐 **UX de Confirmation - Double-Click pour Punitions**
Pour actions irrévocables (Divorce -50%, Emprisonnement, Sabotage critique) :

**Click 1 (Danger)** : 💀 Divorcer
→ Embed rouge sang, avertissement : "⚠️ ATTENTION ! 50% de vos biens seront INCINÉRÉS par le Feu Royal. Votre union sera dissoute à jamais. Confirmez votre folie ?"

**Click 2 (Redevient Danger)** : 🔥 CONFIRMER LA RUINE
→ Action exécutée, résultat final affiché

### 📱 **Messages d'Erreur - Contextuel & Éducatif**
- "⚰️ Solde insuffisant pour ce tribut"
- "☠️ Creature inerte : seul l'Incubateur sacré peut la réanimer"
- "⛓️ Vous êtes emprisonné(e) dans le Cachot. Liberté à [heure]"
- "🔗 Cette ordonnance n'a été que partiellement votée"

---

## 🔧 **Système de Configuration - Ordonnances Royales**

### 🎛️ **Features Désactivables**
Le Souverain peut désactiver individuellement chaque mécanique :

- **Échoppe** 🛒 : Achats d'artefacts
- **Créatures** 🐉 : Système de drageons/squelettes
- **Royaumes** 👑 : Création de territoires
- **Alliances** 👨‍👩‍👧‍👦 : Système matrimonial (mariage/divorce)
- **Conflit** ⚔️ : PvP, sabotage, emprisonnement
- **Économie** 💰 : Tous les aspects financiers
- **Tributs** 💸 : Transferts entre joueurs
- **Obole** 🎁 : Récompenses quotidiennes

### 👑 **Permissions Admin - Grâce Royale**
- **Configuration** : `/setup-admin @role` (Propriétaire serveur uniquement)
- **Rôle admin** : Défini dynamiquement via commande
- **Propriétaire serveur** : Accès automatique à toutes les commandes
- **Commandes restreintes** : `/config`, `/admin-*`, `/setup-admin`, `/emprisonner`
- **Stockage** : Configuration sauvegardée en base de données

### 🔄 **Initialisation Auto - Légis Predefinies**
- **Configs par défaut** : Toutes features activées
- **Migration DB** : Table `GameConfig` + `CooldownPersistent` + `Emprisonnement`
- **Seed data** : Artefacts boutique pré-remplis avec descriptions archaïques

---

## 📊 **Métriques & Balance - Équilibre des Pouvoirs**

### 📈 **Économie - Contrôle de l'Inflation**
- **Inflation contrôlée** : Obole +1000💰, taxe seigneuriale 5%, **prix des items (dont Puîné) modifiables dynamiquement**
- **Balance destruction** : Divorce -50%, Boutique consomme, Combat redistribue
- **Richesse concentrée** : Top 10 tracké, familles fusionnent les fortunes
- **Grâce royale** : Admins/Propriétaires exempt de taxes

### ⚔️ **Combat & Sabotage - Balance Mortelle**
- **Animations Cinématiques** : Immersion avec délais dynamiques pour la commande `/attaque` avant l'affichage du rapport de bataille.
- **Rapport de Guerre Avancé** : Détaille les montants volés, les dragons massacrés et affiche des GIFs de victoire/défaite.
- **Formule puissance dragons** : T1=10pts, T2=50pts, T3=100pts, **Puîné=1pt**
- **Taux victoire** : Attaquant gagne 75% argent volé si victoire
- **Sabotage mortel** : 50% chance dragon devient Squelette (état figé)
- **Cooldowns persistants** : 24h stockés en DB (survive redémarrages!) via `CooldownPersistent`
- **Emprisonnement** : 1h automatique ou libération manuelle par Souverain

### 💔 **Mariage & Divorce - Pénalité Extrême**
- **Union fusionnelle** : 1 argent_commun partagé, 2 propriétaires
- **Divorce destruction** : 50% de total DÉTRUIT + 50% split = perte nette 50%
- **Exemple brutal** : 1000💰 común → 500💰 incinérés + 250💰 chacun
- **Dragons restent** : Liés au propriétaire originel, pas affectés par divorce

### 🐉 **Dragons Spectraux - Mécaniques Sombres**
- **États persistants** : Vivant (combat possible) / Squelette (inerte) / Incinéré (perdu à jamais)
- **Incubateur rôle** : SEUL artefact qui réanime un Squelette en Vivant
- **Faim/Énergie** : Baissent lentement, consomment ressources, ne regen pas auto
- **Niveau up** : Automatique après combats gagnés + nourrissage régulier
- **Mort définitive** : Après N sabotages ou faim critique = Squelette puis poubelle

### 👑 **Royaumes - Territoires Recréés**
- **Création auto Discord** : Catégorie + 4 salons (#palais, #place-publique, #caserne, #cachot)
- **Permissions liées** : Mis à jour en temps réel via API Discord
- **Rôle Souverain** : Auto-attribué au propriétaire, gère accès
- **Cachot fonctionnel** : Déplacement vocal + mute bot pour prisonniers

---

## 🐛 **Débogage & Maintenance**

### 📝 **Logs**
```bash
# Logs console
npm run dev

# Logs DB
npx prisma studio
```

### 🔄 **Migrations DB**
```bash
# Nouvelle migration
npx prisma migrate dev --name feature_name

# Reset DB
npx prisma migrate reset
```

### 🧪 **Tests**
```bash
# Build check
npm run build

# Type check
npx tsc --noEmit
```

---

## 🎯 **Roadmap & Évolutions - Quêtes Futures**

### 🚀 **Fonctionnalités Futures**
- [ ] **Guildes Ténébreuses** : Alliances inter-serveurs permanentes
- [ ] **Événements Apocalyptiques** : Tournois sanglants, raids mondiaux
- [ ] **Forge des Artefacts** : Système de craft d'items rares
- [ ] **Prophéties** : Quêtes mystiques avec récompenses légendaires
- [ ] **Marché Noir** : Trading secret entre Souverains
- [ ] **Taxes Royales** : Système de tribut auto aux Empires

### 🔧 **Améliorations Techniques**
- [ ] **Cache Redis** : Performance DB extrême
- [ ] **Dashboard Web** : Interface admin seigneuriale
- [ ] **API REST** : Intégrations externes
- [ ] **Multilingue** : Support des langues anciennes
- [ ] **Backup Éternel** : Sauvegardes auto infinies

---

**Bon courage à vous, Souverain ! Que votre règne soit sombre et prospère. 🏰🔥**
### 🛠️ **Dernières Mises à Jour (Mars 2026)**
- **Migration UI en Images** : Remplacement quasi total des retours textuels (Embeds) par des images générées dynamiquement via Puppeteer (HTML/CSS Dark Fantasy) pour les commandes interactives.
- **Correctifs Interactions** : Résolution du crash `Echec de l'interaction` sur la commande `/marier` (conflit de scope entre l'interaction du bouton et l'interaction SlashCommand) et standardisation.

## Récents Développements (Mars 2026)
- **Gestion des Rôles Automatisée** : Création automatique de rôles Discord lors de la fondation d'un Royaume (Principal vs Frontalier), création d'Alliances, et Mariages.
- **Rôle Prisonnier et Cachots** : Le bot gère automatiquement lors de son redémarrage ou de son ajout sur un nouveau serveur la création d'une catégorie "🔒 Prison" (invisible pour `@everyone`) contenant un channel textuel `cellule` et vocal `parloir` (avec les permissions exclusives pour le rôle `Prisonnier`).
- **Économie et Mandats** : Les commandes `/perquisition` et `/emprisonner` exclusives au STAFF ou aux Rois sont devenues des articles achetables dans la boutique : *Mandat de Perquisition*, *Mandat d'Emprisonnement*. Ils s'utilisent depuis l'inventaire et ouvrent un menu de sélection Discord permettant de choisir sa cible.

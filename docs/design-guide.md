# 🎨 DESIGN GUIDE - Grimoire Visuel du Souverain

> Guide de style complet pour tous les embeds Discord, messages, terminologie et composants du Bot Souverain. **À consulter AVANT d'implémenter toute commande ou feature.**

---

## 🌈 **PALETTE DE COULEURS - Codes Hex Obligatoires**

Chaque embed Discord DOIT utiliser UNE SEULE couleur de bordure selon le contexte. Ne pas mélanger.

| Contexte | Couleur | Hex | RGB | Utilisation |
|----------|---------|------|------|------|
| **InfoGénéral** | Gris Tombeau | `#424242` | `66,66,66` | Info basiques, consultations, statuts |
| **Royauté** | Or Terni | `#B8860B` | `184,134,11` | Royaumes, titres, prestige, richesse |
| **Danger** | Sang Séché | `#8B0000` | `139,0,0` | Combat, attaques, sabotage, mort |
| **Succès** | Vert Mousse | `#006400` | `0,100,0` | Guérison, réussite, gain, soin |
| **Mort** | Noir Abyssal | `#000000` | `0,0,0` | Cooldowns, squelettes, inactivité |

### **Application stricte :**
```javascript
// CORRECT:
const embed = new EmbedBuilder()
  .setColor(0x424242)  // Gris Tombeau pour info générale
  .setTitle("🔮 Consulter")
  
// FAUX:
const embed = new EmbedBuilder()
  .setColor(0xFFD700)  // ❌ Or cyber (INTERDIT)
  .setColor("random")  // ❌ Aléatoire (INTERDIT)
```

---

## 📜 **TERMINOLOGIE ARCHAÏQUE - Dictionnaire Strict**

Toute commande/réponse DOIT remplacer les termes modernes par leurs équivalents Dark Fantasy.

### **Termes à Bannir Absolument ❌**
- "Transaction" → **Sceau Royal**
- "Daily" / "Récompense quotidienne" → **Obole Quotidienne**
- "Shop" / "Boutique" → **Échoppe de l'Alchimiste**
- "Items" → **Artefacts** ou **Créatures**
- "Buy" / "Acheter" → **Acquérir** ou **Invoquer**
- "Configuration" → **Ordonnance Royale**
- "Bypass" / "Exempt" → **Grâce Royale** ou **Exempté par Décret**
- "Chat command" → **Murmure du Trône** ou **Invocation**
- "Inventory" → **Arsénal** ou **Registre des Possessions**
- "Money" → **Tribut**, **Pièces d'Or**, **Deniers Royaux** (jamais "$")
- "User" → **Sujet**, **Souverain**, **Seigneur** (selon contexte)
- "Server" → **Royaume** ou **Domaine**

### **Transformations d'Exemples Complets**

**Avant (❌):**
```
✅ Daily reward claimed!
You received 1000$
```

**Après ✅:**
```
📜 OBOLE QUOTIDIENNE VERSÉE
└> +1000💰 Tribut Royal déposé en votre coffre

┴─────────────────────────────
Prochain versement: demain à 09:00
```

**Avant (❌):**
```
You bought: Dragon T1
Cost: 5000$
```

**Après ✅:**
```
🐉 CRÉATURE INVOQUÉE AVEC SUCCÈS

┴─────────────────────────────
└> Jeune Dragon de Feu (T1)
└> Invoqation: 5000💰 Deniers Royaux
└> État: Vivant & Affamé
```

**Avant (❌):**
```
Transaction failed: Insufficient funds
```

**Après ✅:**
```
⚰️ SCEAU ROYAL ROMPU

┴─────────────────────────────
Vos caisses sont vidées, Sire.
Tribut insuffisant: manque 500💰
```

---

## 🎭 **EMOJIS THÉMATIQUES COHÉRENTS**

### **Set d'Emojis Canoniques - Utilisé PARTOUT**

| Concept | Emoji Principal | Alternatives | Context |
|---------|---|---|---|
| **Monnaie** | 💰 | 💎 (luxe) | "Vous avez 1000💰" |
| **Dragon Vivant** | 🐉 | 🔥 (puissance) | "Tiers 3: 🐉 Ancien Dragon" |
| **Dragon Squelette** | ☠️🐉 | 💀 | "État: ☠️🐉 Squelette" |
| **Incubateur** | 🔮 | 📿 | "Item sacré: 🔮 Incubateur" |
| **Artefact/Item** | 📿 | 🔱 (magique) | "Artefacts: 3x 📿" |
| **Royauté** | 👑 | 🏰 | "Souverain 👑 de [Nom]" |
| **Royaumes** | 🏰 | 👑 | "Votre 🏰 Royaume" |
| **Combat** | ⚔️ | 🩸 (violence) | "⚔️ Lancer l'Assaut" |
| **Danger** | ⚡ | 🩸 | "⚡ ATTENTION !" |
| **Magie/Soin** | 🔮 | 🍷 (alchimie) | "Soins: 🔮 Restauration" |
| **Mariage/Union** | 💕 | 💑 | "💕 Union Scellée" |
| **Divorce/Destruction** | 💔 | 🔥 | "💔 Union Détruite" |
| **Prison/Chaîne** | 🔗 | ⛓️ | "🔗 Emprisonné" |
| **Mort** | ⚰️ | 💀 | "⚰️ Créature Morte" |
| **Succès** | ✅ | 🟢 | "✅ Action Réussie" |
| **Erreur** | ❌ | 🔴 | "❌ Action Échouée" |
| **Info** | ℹ️ | 📜 | "ℹ️ Information" |

### **INTERDICTION STRICTE ❌**
- Ne **JAMAIS** utiliser d'emojis "neon" ou "cyber" (⚡🔆🌐)
- Ne **JAMAIS** utiliser emoji "$" pour argent (utiliser 💰)
- Ne **JAMAIS** mélanger les emojis (un dragon = 🐉, pas 🐲 ou 🦎)

---

## 📜 **STRUCTURE DES EMBEDS - ASCII Gothique**

### **Template Standard pour Tous les Embeds**

```
┬─────────────────────────────────────────
│ 🔮 TITRE EN PETITES CAPS (emoji + titre)
┴─────────────────────────────────────────

┌─ Champ Principal
└> Contenu visible avec puces

┌─ Champ Secondaire (optionnel)
└> Infos supplémentaires

──────────────────────────────────────────
💬 Pied de page (optionnel)
```

### **Variantes de Séparateurs**

```
Séparation de sections:     ──────────────────────────
Titre avec emoji:           ▬▬▬▬▬▬ ⚔️ ▬▬▬▬▬▬
Sous-section:               ▬▬▬ 🔮 ▬▬▬
Avertissement:              ⚠️  ou ⚡
Listes à puces:             └> ou • ou †
Double ligne (fin):         ═══════════════════════════
```

### **Code Discord.js Obligatoire**

```typescript
import { EmbedBuilder } from 'discord.js';

const embed = new EmbedBuilder()
  // Couleur selon contexte (voir palette)
  .setColor(0x424242)  // Gris Tombeau = info générale
  
  // Titre toujours avec emoji thématique
  .setTitle("🐉 MÉNAGERIE DES CRÉATURES")
  
  // Contenu structuré
  .addFields(
    {
      name: "▬▬▬ 🔥 Dragons Vivants ▬▬▬",
      value: "└> Ancien Dragon de Feu (T3) - Lvl 15\n└> Dragon Adulte (T2) - Lvl 8",
      inline: false
    },
    {
      name: "▬▬▬ ☠️ Squelettes Figés ▬▬▬",
      value: "└> Jeune Dragon (T1) - Morte depuis 3j",
      inline: false
    }
  )
  
  // Footer avec timestamp
  .setFooter({ text: "Registre des Âmes • Enregistré par Discord" });

await interaction.reply({ embeds: [embed] });
```

---

## 🎮 **BOUTONS DISCORD - Codage Couleur Strict**

### **Style → Couleur → Utilisation**

| Style Discord | Code | Couleur | Usage Souverain | Exemple |
|---|---|---|---|---|
| **PRIMARY** | 1 | Bleu | Navigation, consultation simple | 🔍 Voir les Dragons, 📜 Lire les Règles |
| **SUCCESS** | 3 | Vert | Gain, achat, CONFIRMATION positive | 💰 Acquérir, 📿 Invoquer, ✅ Confirmer |
| **DANGER** | 4 | Rouge | Actions irréversibles & mortelles | 💀 Divorcer, 🩸 Tuer, 🔥 Incinérer |
| **SECONDARY** | 2 | Gris | Retour, annulation, cooldown | ❌ Annuler, ↩️ Précédent, ⏳ En Attente |

### **Type + Style de Bouton (Discord.js)**

```typescript
// Navigation (PRIMARY - Bleu)
new ButtonBuilder()
  .setCustomId('view_dragons')
  .setLabel('🔍 Voir la Ménagerie')
  .setStyle(ButtonStyle.Primary);

// Achat/Gain (SUCCESS - Vert)
new ButtonBuilder()
  .setCustomId('buy_dragon_t1')
  .setLabel('💰 Acquérir Dragon T1 (500💰)')
  .setStyle(ButtonStyle.Success);

// Action irréversible (DANGER - Rouge)
new ButtonBuilder()
  .setCustomId('confirm_divorce')
  .setLabel('💀 CONFIRMER LA RUINE')
  .setStyle(ButtonStyle.Danger);

// Annulation (SECONDARY - Gris)
new ButtonBuilder()
  .setCustomId('cancel')
  .setLabel('❌ Annuler')
  .setStyle(ButtonStyle.Secondary);
```

---

## 🔐 **UX DE CONFIRMATION - Double-Click Pattern**

Pour actions MORTELLEMENT irréversibles (Divorce, Emprisonnement, Sabotage critique):

### **État 1 : Alerte Initiale (Danger - Rouge)**
```
┬─────────────────────────────────────────
│ ⚠️ ATTENTION - ACTION IRRÉVERSIBLE
┴─────────────────────────────────────────

Vous êtes sur le point de DIVORCER.

Effet immédiat:
├─ 50% de votre fortune INCINÉRÉE par le Feu Royal
├─ 50% restant split 50/50 entre conjoints
└─ Union dissoute à jamais

Confirmez-vous cette folie ?

[💀 CONFIRMER LA RUINE] [❌ Annuler]
```

Bouton action: **DANGER** (rouge)

### **État 2: Après Click 1**
```
┬─────────────────────────────────────────
│ 🔥 RUINE EN COURS
┴─────────────────────────────────────────

Votre union s'effondre dans les flammes...

Avant: 1000💰 (commun) + 500💰 (perso)
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
Perdu: -500💰 (incinérés)
Vous recevez: +250💰 (votre moitié)
[Conjoint] reçoit: +250💰 (sa moitié)

✅ Divorce finalisé.
```

---

## 📱 **MESSAGES D'ERREUR - Contextuels & Éducatifs**

Chaque erreur doit être **spécifique**, **utile** et **parlante**:

### **Erreurs Économiques**
```
⚰️ SCEAU ROYAL INSUFFISANT
Vous disposez de 200💰, mais cette action coûte 500💰
Manque: 300💰

Conseils:
└> Utilisez /obole pour votre tribut quotidien
└> Vendez des artefacts (commande /vendre)
```

### **Erreurs Dragons**
```
☠️ CRÉATURE INERTE
Votre Dragon T1 est un Squelette depuis 5 jours
Il ne peut durer que 30 jours sans ressuscitation

Options:
└> Achetez 🔮 Incubateur (Échoppe, 2000💰)
└> Utilisez /revivre <index> pour l'animer
```

### **Erreurs Cooldown** (Noir Abyssal)
```
⏳ SCEAU ROYAL FERMÉ
Cette action est sous cooldown (persists après redémarrage!)

Dernier usage: Hier à 14h30
Prochain usage: Demain à 14h30 (dans ~19h12m)

Les Ordonnances Royales le permettent: utilisez /ordonnance toggle
```

### **Erreurs Permissions**
```
🔗 GRÂCE ROYALE INSUFFISANTE
Seul un Souverain peut emprisonner (commande /emprisonner)

Votre rôle: Sujet
Rôles autorisés: Souverain, Admin

Contact: demandez au Souverain du Royaume
```

---

## 🔄 **PATTERNS DE RÉPONSE - Templates Rapides**

### **Succès Simple**
```
✅ ACTION RÉUSSIE

┴─────────────────────────────
Résultat: [description courte]
```

### **Succès avec Détails**
```
✅ [ACTION] RÉUSSIE

┬─────────────────────────────
│ Détail 1: valeur
│ Détail 2: valeur
│ Détail 3: valeur
┴─────────────────────────────
```

### **Flux Interaction (Ex: Paiement)**
```
┬─────────────────────────────
│ 📜 SCEAU ROYAL: TRIBUT
┴─────────────────────────────

De: [Donnateur] (5000💰)
Vers: [Receveur]
Raison: "Tribut pour services rendus"

┌─ Transaction confirmée
└> Deniers transférés ✅

[Nouveau solde: 2500💰]
```

---

## ✅ **CHECKLIST D'IMPLÉMENTATION**

Avant de commit une commande/feature, vérifiez:

- [ ] **Couleur embed**: Une SEULE couleur de la palette (pas de "random")
- [ ] **Terminologie**: Aucun mot moderne (shop, buy, transaction, etc.)
- [ ] **Emojis**: Utilisés depuis le set canonique
- [ ] **Structure**: ASCII gothique avec séparateurs appropriés
- [ ] **Boutons**: Couleurs de style correctes (SUCCESS pour achat, DANGER pour irréversible)
- [ ] **Messages d'erreur**: Spécifiques, éducatifs, avec conseils
- [ ] **Confirmation double-click**: Pour actions mortelles (divorce, emprisonnement)
- [ ] **Timestamps**: Footer avec contexte
- [ ] **Ton de voix**: Solennelle, archaïque, jamais condescendante
- [ ] **Accesibilité**: Pas de murs de texte (utiliser des champs Discord séparés)

---

**Que ce guide soit votre grimoire sacré. Chaque pixel compte dans l'univers du Souverain. 🏰**

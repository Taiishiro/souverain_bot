/**
 * 🎨 DARK FANTASY EMBEDS
 * Tous les embeds Discord pour le Bot Souverain
 * Respecte DESIGN_GUIDE.md pour couleurs, emojis et terminologie
 */

import { EmbedBuilder, User } from 'discord.js';
import { COLORS, EMOJIS, SEPARATORS } from './colors';

/**
 * ✅ Succès général (Vert Mousse #006400)
 */
export function successEmbed(title: string, description: string, author?: User) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.SUCCESS} ${title.toUpperCase()}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: `Registre des Âmes • Le Bot Souverain`,
      iconURL: author?.displayAvatarURL() || undefined,
    });

  return embed;
}

/**
 * ❌ Erreur (Noir Abyssal #000000)
 */
export function errorEmbed(title: string, description: string, author?: User) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.DEATH)
    .setTitle(`${EMOJIS.ERROR} ${title.toUpperCase()}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: `Enregistrement Ténébreux • Le Bot Souverain`,
      iconURL: author?.displayAvatarURL() || undefined,
    });

  return embed;
}

/**
 * ℹ️ Information générale (Gris Tombeau #424242)
 */
export function infoEmbed(title: string, description: string, author?: User) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.INFO} ${title.toUpperCase()}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: `Chroniques du Trône • Le Bot Souverain`,
      iconURL: author?.displayAvatarURL() || undefined,
    });

  return embed;
}

/**
 * 📜 SCEAU ROYAL - Paiement entre Seigneurs
 */
export function paiementEmbed(
  from: string,
  to: string,
  montant: bigint,
  taxe: bigint,
  fromAvatar?: string,
  toAvatar?: string,
  raison?: string
) {
  let description = `
${SEPARATORS.TITLE('💰')}
${EMOJIS.LIST} De: **${from}**
${EMOJIS.LIST} Vers: **${to}**
${EMOJIS.LIST} Tribut: **${montant.toLocaleString()}${EMOJIS.COINS}**`;

  if (taxe > 0) {
    description += `\n${EMOJIS.LIST} Taxe Royale: ${taxe.toLocaleString()}${EMOJIS.COINS} (5%)`;
  }
      description += `\n${EMOJIS.LIST} Sceau de l'Ombre: ${taxe.toLocaleString()}${EMOJIS.COINS} (5%)`;
  if (raison && raison.trim()) {
    description += `\n\n📝 Sceau: *"${raison}"*`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.ROYALTY)
    .setTitle(`📜 SCEAU ROYAL`)
    .setDescription(description)
    .setThumbnail(fromAvatar || null)
    .setFooter({
      text: `Sigillum Regis • ${new Date().toLocaleString('fr')}`,
    })
    .setTimestamp();

  return embed;
}

/**
 * 💰 REGISTRE DE FORTUNE - Afficher le solde personnel
 */
/**
 * Embed fortune unifié : nom, argent, barre, classement, avatar
 * @param user_name Nom affiché
 * @param argent Fortune du joueur
 * @param bar Barre de progression (déjà formatée)
 * @param classement Classement (déjà formaté)
 * @param avatar URL de l'avatar
 */
export function richesseEmbed(user_name: string, argent: bigint, bar: string, classement: string, avatar?: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.ROYALTY)
    .setTitle(`${EMOJIS.CROWN} REGISTRE DE FORTUNE`)
    .setDescription(`**${user_name}**`)
    .addFields(
      {
        name: `${SEPARATORS.SUBTITLE('💰')} Tribut Personnel`,
        value: `\"\"\"${argent.toLocaleString()}${EMOJIS.COINS}\"\"\"`,
        inline: false,
      },
      {
        name: 'Progression',
        value: bar,
        inline: false,
      },
      {
        name: 'Classement',
        value: classement,
        inline: true,
      }
    )
    .setThumbnail(avatar || null)
    .setFooter({ text: 'Cofres Royaux • Le Bot Souverain' })
    .setTimestamp();
  return embed;
}

/**
 * 🐉 MÉNAGERIE - Récapitulatif dragons du joueur
 */
export function dragonListEmbed(
  user_name: string,
  dragons: Array<{
    index: number;
    nom: string;
    tiers: string;
    niveau: number;
    etat: string;
    faim: number;
    energie: number;
  }>,
  avatar?: string
) {
  let dragonsList = '';

  if (dragons.length === 0) {
    dragonsList = `${EMOJIS.LIST} Aucune créature invoquée\n\nUtilisez /boutique pour acquérir des dragons`;
  } else {
    dragonsList = dragons
      .map((d) => {
        const emoji =
          d.etat === 'Vivant'
            ? EMOJIS.DRAGON_ALIVE
            : d.etat === 'Squelette'
              ? EMOJIS.DRAGON_SKELETON
              : EMOJIS.DRAGON_DEAD;

        return `${EMOJIS.LIST} **[${d.index}]** ${emoji} ${d.nom} (${d.tiers}) Lvl${d.niveau}\n    └─ État: ${d.etat} | Faim: ${d.faim}% | Énergie: ${d.energie}%`;
      })
      .join('\n');
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`🐉 MÉNAGERIE DES CRÉATURES`)
    .setDescription(`**${user_name}**\n\n${SEPARATORS.SECTION}\n${dragonsList}`)
    .setThumbnail(avatar || null)
    .setFooter({ text: 'Bestiaire des Âmes • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * ☠️ CRÉATURE INERTE - Dragon devient Squelette
 */
export function skeletonWarningEmbed(dragonName: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.DEATH)
    .setTitle(`${EMOJIS.SKULL} CRÉATURE TOMBÉE EN RUINES`)
    .setDescription(
      `**${dragonName}** est devenu un Squelette ficelé\n\n` +
        `${EMOJIS.LIST} État: ${EMOJIS.DRAGON_SKELETON} Squelette (INERTE)\n` +
        `${EMOJIS.LIST} Combat: IMPOSSIBLE\n` +
        `${EMOJIS.LIST} Récupération: ${EMOJIS.MAGIC} Incubateur Sacré requis`
    )
    .setFooter({ text: 'Repos Éternel • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * 🔮 INCUBATEUR SACRÉ - Réanimer un Squelette
 */
export function revivalEmbed(dragonName: string, incubatorCost: number) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${EMOJIS.MAGIC} INCUBATEUR ACTIVÉ`)
    .setDescription(
      `**${dragonName}** revient à la vie!\n\n` +
        `${EMOJIS.LIST} État: ${EMOJIS.DRAGON_ALIVE} Vivant (Restauré)\n` +
        `${EMOJIS.LIST} Faim: 100%\n` +
        `${EMOJIS.LIST} Énergie: 100%\n` +
        `${EMOJIS.LIST} Coût: ${incubatorCost}${EMOJIS.COINS} (1x 🔮 Incubateur)`
    )
    .setFooter({ text: 'Résurrection Spectrale • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * 💕 UNION SCELLÉE - Mariage avec fusion de comptes
 */
export function marriageEmbed(
  user1: string,
  user2: string,
  familleNom: string,
  totalMoney: bigint,
  inventaire: Record<string, number>
) {
  const itemCount = Object.values(inventaire).reduce((a, b) => a + b, 0);
  const itemsStr = itemCount > 0 ? `${itemCount} artefacts` : 'aucun artefact';

  const embed = new EmbedBuilder()
    .setColor(COLORS.ROYALTY)
    .setTitle(`${EMOJIS.MARRIAGE} UNION CHARNELLE SCELLÉE`)
    .setDescription(
      `**${user1}** & **${user2}** sont liés à jamais par le Trône\n\n` +
        `${SEPARATORS.SECTION}\n` +
        `${EMOJIS.LIST} Nom de l'Union: **${familleNom}**\n` +
        `${EMOJIS.LIST} Argent commun: ${totalMoney.toLocaleString()}${EMOJIS.COINS}\n` +
        `${EMOJIS.LIST} Artefacts: ${itemsStr}\n` +
        `${EMOJIS.LIST} Droits: Dissolution = Destruction 50% inévitable\n` +
        `${SEPARATORS.SECTION}`
    )
    .setFooter({ text: 'Hyménée Royal • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * 💔 DIVORCE - Union Détruite (50% incinérés + 50% split!)
 */
export function divorceEmbed(
  user1: string,
  user2: string,
  totalBefore: bigint,
  destroyed: bigint,
  user1Gets: bigint,
  user2Gets: bigint
) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.DANGER)
    .setTitle(`💔 UNION DISSOUTE PAR LE FEU ROYAL`)
    .setDescription(
      `La Couronne détruit l'Hyménée de **${user1}** & **${user2}**\n\n` +
        `${SEPARATORS.SECTION}\n` +
        `${EMOJIS.LIST} Avant: ${totalBefore.toLocaleString()}${EMOJIS.COINS} (commun)\n` +
        `${EMOJIS.LIST} 🔥 Incinérés: **${destroyed.toLocaleString()}${EMOJIS.COINS}** (50% DÉTRUIT)\n` +
        `${SEPARATORS.SECTION}\n` +
        `${EMOJIS.LIST} **${user1}** reçoit: ${user1Gets.toLocaleString()}${EMOJIS.COINS}\n` +
        `${EMOJIS.LIST} **${user2}** reçoit: ${user2Gets.toLocaleString()}${EMOJIS.COINS}`
    )
    .setFooter({ text: 'Ruine Légale • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * 🔗 MANDAT D'ARRÊT - Emprisonnement
 */
export function imprisonmentEmbed(
  prisonnerName: string,
  reason: string,
  royaumeName: string,
  releaseTime: Date
) {
  const timeRemaining = Math.ceil((releaseTime.getTime() - Date.now()) / 1000);
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);

  const embed = new EmbedBuilder()
    .setColor(COLORS.DANGER)
    .setTitle(`${EMOJIS.CHAIN} MANDAT D'EMPRISONNEMENT EXÉCUTÉ`)
    .setDescription(
      `**${prisonnerName}** a été jeté au cachot\n\n` +
        `${SEPARATORS.SECTION}\n` +
        `${EMOJIS.LIST} Prisonnier: **${prisonnerName}**\n` +
        `${EMOJIS.LIST} Lieu: #cachot du ${EMOJIS.CASTLE} **${royaumeName}**\n` +
        `${EMOJIS.LIST} Raison: *"${reason}"*\n` +
        `${EMOJIS.LIST} Mute: ACTIVÉ (impossible de parler)\n` +
        `${SEPARATORS.SECTION}\n` +
        `${EMOJIS.LIST} Libération: ${hours}h ${minutes}m`
    )
    .setFooter({ text: 'Justice Royale • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * ⏳ COOLDOWN - Action en cooldown
 */
export function cooldownEmbed(action: string, remainingSeconds: number) {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  let timeStr = '';
  if (hours > 0) timeStr += `${hours}h`;
  if (minutes > 0) timeStr += ` ${minutes}m`;
  if (seconds > 0) timeStr += ` ${seconds}s`;

  const embed = new EmbedBuilder()
    .setColor(COLORS.DEATH)
    .setTitle(`${EMOJIS.WARNING} SCEAU ROYAL FERMÉ`)
    .setDescription(
      `Cette action est sous cooldown (persiste après redémarrage)\n\n` +
        `${EMOJIS.LIST} Action: **${action}**\n` +
        `${EMOJIS.LIST} Disponible dans: **${timeStr}**`
    )
    .setFooter({ text: 'Attente Forcée • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * 🏰 ROYAUME CRÉÉ - Couronne acquise
 */
export function royaumeCreatedEmbed(
  royaumeName: string,
  owner: string,
  cost: bigint,
  vocalId: string,
  itemNom: string = 'Royaume'
) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.ROYALTY)
    .setTitle(`🏰 COURONNE ACQUISE`)
    .setDescription(
      `**${owner}** fonde le Royaume de **${royaumeName}**\n\n` +
        `${SEPARATORS.SECTION}\n` +
        `${EMOJIS.LIST} Roi: **${owner}**\n` +
        `${EMOJIS.LIST} Coût: 1 ${itemNom}\n` +
        `${EMOJIS.LIST} Salon Vocal: <#${vocalId}>\n` +
        `${EMOJIS.LIST} Rôle: Roi de ${royaumeName} (attribué)`
    )
    .setFooter({ text: 'Fondation Royale • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * ⚔️ ATTAQUE - Combat en cours
 */
export function attackEmbed(
  attacker: string,
  defender: string,
  moneyStolen: bigint,
  damageDealt: number
) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.DANGER)
    .setTitle(`${EMOJIS.SWORD} LANCER L'ASSAUT`)
    .setDescription(
      `**${attacker}** attaque **${defender}**!\n\n` +
        `${SEPARATORS.SUBTITLE('⚔️')} Résultats:\n` +
        `${EMOJIS.LIST} Argent volé: ${moneyStolen.toLocaleString()}${EMOJIS.COINS}\n` +
        `${EMOJIS.LIST} Dragons dommages: ${damageDealt} points`
    )
    .setFooter({ text: 'Conflit du Trône • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * 📋 INVENTAIRE - Affichage des biens
 */
export function inventaireEmbed(
  username: string,
  inventaire: Record<string, number>,
  argent: bigint,
  royaumeLevel?: number,
  dragonsCount?: number
) {
  const items = Object.entries(inventaire)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => `${EMOJIS.LIST} ${name}: **${count}x**`)
    .join('\n');

  const description =
    items.length > 0
      ? `${SEPARATORS.SECTION}\n${items}\n${SEPARATORS.SECTION}`
      : `${SEPARATORS.SECTION}\nLe coffre est vide.\n${SEPARATORS.SECTION}`;

  const royaumeTexte = royaumeLevel !== undefined ? `\n${EMOJIS.CASTLE} Royaume: **Niveau ${royaumeLevel}**` : '';
  const dragonsTexte = dragonsCount !== undefined ? `\n${EMOJIS.DRAGON_ALIVE} Créatures: **${dragonsCount}**` : '';

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.SCROLL} REGISTRE DES BIENS`)
    .setDescription(
      `**${username}** possède:\n\n${EMOJIS.COINS} Argent: **${argent.toLocaleString()}** $\n${royaumeTexte}${dragonsTexte}\n\n${EMOJIS.ARTIFACT} **Artefacts:**\n${description}`
    )
    .setFooter({ text: 'Trésor du Royaume • Le Bot Souverain' })
    .setTimestamp();

  return embed;
}

/**
 * Utilitaires: Déterminer statut financier
 */
function getWealthStatus(amount: bigint): string {
  if (amount >= BigInt(50000)) return '💎 Trésor des Ombres';
  if (amount >= BigInt(10000)) return '💰 Trésor Sombre';
  if (amount >= BigInt(5000)) return '🏆 Trésor Prospère';
  if (amount >= BigInt(1000)) return '🪙 Trésor Aisé';
  if (amount >= BigInt(500)) return '👤 Trésor Modeste';
  if (amount >= BigInt(100)) return '🎭 Trésor Humble';
  return '⚰️ Trésor Éteint';
}

/**
 * Utilitaires: Déterminer rang royal
 */
function getWealthRank(amount: bigint): string {
  if (amount >= BigInt(100000)) return '👑 Sombre Souverain';
  if (amount >= BigInt(50000)) return '🏰 Grand Maître des Ombres';
  if (amount >= BigInt(10000)) return '⚔️ Guerrier des Ténèbres';
  if (amount >= BigInt(5000)) return '🎭 Noble des Ombres';
  if (amount >= BigInt(1000)) return '👤 Chevalier des Ténèbres';
  if (amount >= BigInt(500)) return '🗡️ Écuyer des Ombres';
  return '👶 Mendiant des Ténèbres';
}

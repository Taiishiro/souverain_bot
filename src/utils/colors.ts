/**
 * 🎨 DARK FANTASY COLOR PALETTE
 * Codes Hex précis pour tous les embeds Discord
 * Reference: DESIGN_GUIDE.md
 */

export const COLORS = {
  // Gris Tombeau - Info générale, neutre, ancien
  INFO: 0x424242,
  
  // Or Terni - Royauté, prestige, richesse ancienne
  ROYALTY: 0xB8860B,
  
  // Sang Séché - Danger, combat, mort, menace
  DANGER: 0x8B0000,
  
  // Vert Mousse - Guérison, succès, soin
  SUCCESS: 0x006400,
  
  // Noir Abyssal - Cooldowns, squelettes, inactivité
  DEATH: 0x000000,
} as const;

/**
 * Obtenir couleur par contexte d'action
 */
export function getColorByContext(
  context:
    | "attaque"
    | "sabotage"
    | "mariage"
    | "divorce"
    | "achat"
    | "soin"
    | "dragon"
    | "royaume"
    | "info"
    | "error"
    | "cooldown"
): number {
  switch (context) {
    case "attaque":
    case "sabotage":
      return COLORS.DANGER;
    case "mariage":
    case "royaume":
      return COLORS.ROYALTY;
    case "divorce":
      return COLORS.DANGER;
    case "achat":
      return COLORS.SUCCESS;
    case "soin":
    case "dragon":
      return COLORS.SUCCESS;
    case "cooldown":
      return COLORS.DEATH;
    case "error":
      return COLORS.DEATH;
    default:
      return COLORS.INFO;
  }
}

/**
 * Séparateurs ASCII Gothiques
 */
export const SEPARATORS = {
  SECTION: "──────────────────────────",
  TITLE: (emoji: string) => `▬▬▬▬▬▬ ${emoji} ▬▬▬▬▬▬`,
  SUBTITLE: (emoji: string) => `▬▬▬ ${emoji} ▬▬▬`,
  LIST: "└>",
  WARNING: "⚠️",
  BREAK: "═══════════════════════════",
} as const;

/**
 * Emojis thématiques canoniques
 */
export const EMOJIS = {
  // Monnaie
  COINS: "💰",
  GEMS: "💎",

  // Dragons
  DRAGON_ALIVE: "🐉",
  DRAGON_SKELETON: "☠️🐉",
  DRAGON_DEAD: "💀",

  // Royauté & Pouvoirs
  CROWN: "👑",
  CASTLE: "🏰",
  THRONE: "👑",

  // Combat
  SWORD: "⚔️",
  BLOOD: "🩸",

  // Magie & Soin
  MAGIC: "🔮",
  POTION: "🍷",
  ARTIFACT: "📿",

  // Mariage & Émotions
  MARRIAGE: "💕",
  DIVORCE: "💔",
  FIRE: "🔥",

  // Prison & Chaînes
  CHAIN: "🔗",
  PRISON: "⛓️",

  // Mort & Absence
  GRAVE: "⚰️",
  SKULL: "💀",

  // Status
  SUCCESS: "✅",
  ERROR: "❌",
  WARNING: "⚡",
  INFO: "ℹ️",
  SCROLL: "📜",

  // Séparateurs & indicateurs
  LIST: "└>",
} as const;

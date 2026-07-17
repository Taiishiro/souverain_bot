/**
 * Retourne le classement (rang) du joueur par fortune (solo ou famille)
 */
export async function getUserWealthRank(discordId: string, isFamille: boolean): Promise<number> {
  if (isFamille) {
    // Chercher la famille du joueur
    const user = await prisma.user.findUnique({ where: { discordId }, include: { famille: true } });
    if (!user?.famille_id) return -1;
    const familles = await prisma.famille.findMany({ orderBy: { argent_commun: 'desc' } });
    const idx = familles.findIndex(f => f.id === user.famille_id);
    return idx >= 0 ? idx + 1 : -1;
  } else {
    const users = await prisma.user.findMany({ orderBy: { argent_perso: 'desc' } });
    const idx = users.findIndex(u => u.discordId === discordId);
    return idx >= 0 ? idx + 1 : -1;
  }
}

/**
 * Génère une barre de progression unicode pour la fortune
 */
export function generateWealthBar(current: bigint, max: bigint = BigInt(100000)) {
  const totalBlocks = 20;
  const ratio = Math.min(Number(current) / Number(max), 1);
  const filled = Math.round(ratio * totalBlocks);
  const empty = totalBlocks - filled;
  return '|' + '█'.repeat(filled) + '░'.repeat(empty) + '|';
}
/**
 * Calcule la puissance totale d'un joueur (dragons vivants + puînés)
 */
export async function getUserTotalPower(userId: string): Promise<number> {
  // Puissance dragons vivants
  const dragons = await prisma.dragon.findMany({ where: { owner_id: userId, etat: 'Vivant' } });
  let power = dragons.reduce((acc, d) => acc + (d.puissance || 0), 0);

  // Puissance puînés (dans inventaire)
  const user = await prisma.user.findUnique({ where: { discordId: userId } });
  if (user && user.inventaire) {
    const inv = user.inventaire as Record<string, number>;
    if (inv['Puîné']) {
      power += inv['Puîné'] * 1; // 1 pt par puîné
    }
  }
  return power;
}
import { prisma } from '../../db/prisma';

/**
 * Obtient ou crée un utilisateur
 */
export async function getOrCreateUser(discordId: string) {
  const user = await prisma.user.findUnique({
    where: { discordId },
  });

  if (user) return user;

  // Créer un nouvel utilisateur
  return prisma.user.create({
    data: {
      discordId,
      argent_perso: BigInt(0),
      inventaire: {},
    },
  });
}

/**
 * Ajoute de l'argent à un utilisateur/famille
 */
export async function addMoney(userId: string, amount: bigint): Promise<boolean> {
  await getOrCreateUser(userId);
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
    include: { famille: true },
  });

  if (!user) return false;

  if (user.famille_id && user.famille) {
    await prisma.famille.update({
      where: { id: user.famille_id },
      data: { 
        argent_commun: { increment: amount }
      },
    });
    // On met à jour l'argent record de la famille
    const newMontant = user.famille.argent_commun + amount;
    if (newMontant > user.famille.argent_record) {
      await prisma.famille.update({
        where: { id: user.famille_id },
        data: { argent_record: newMontant }
      });
    }
  } else {
    const newMontant = user.argent_perso + amount;
    await prisma.user.update({
      where: { discordId: userId },
      data: { 
        argent_perso: { increment: amount },
        argent_record: newMontant > user.argent_record ? newMontant : user.argent_record
      },
    });
  }

  return true;
}

/**
 * Retire de l'argent d'un utilisateur/famille
 */
export async function removeMoney(userId: string, amount: bigint): Promise<boolean> {
  await getOrCreateUser(userId);
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
    include: { famille: true },
  });

  if (!user) return false;

  // Vérifier les fonds
  const currentMoney = user.famille_id ? user.famille?.argent_commun : user.argent_perso;
  if (!currentMoney || currentMoney < amount) return false;

  if (user.famille_id && user.famille) {
    await prisma.famille.update({
      where: { id: user.famille_id },
      data: { argent_commun: { decrement: amount } },
    });
  } else {
    await prisma.user.update({
      where: { discordId: userId },
      data: { argent_perso: { decrement: amount } },
    });
  }

  return true;
}

/**
 * Ajoute un item à l'inventaire d'un utilisateur
 */
export async function addItemToInventory(
  userId: string,
  itemName: string,
  quantity: number = 1
): Promise<boolean> {
  await getOrCreateUser(userId);
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
    include: { famille: true },
  });

  if (!user) return false;

  if (user.famille_id && user.famille) {
    const inventory = user.famille.inventaire_commun as Record<string, number>;
    inventory[itemName] = (inventory[itemName] || 0) + quantity;

    await prisma.famille.update({
      where: { id: user.famille_id },
      data: { inventaire_commun: inventory },
    });
  } else {
    const inventory = user.inventaire as Record<string, number>;
    inventory[itemName] = (inventory[itemName] || 0) + quantity;

    await prisma.user.update({
      where: { discordId: userId },
      data: { inventaire: inventory },
    });
  }

  return true;
}

/**
 * Retire un item de l'inventaire d'un utilisateur
 */
export async function removeItemFromInventory(
  userId: string,
  itemName: string,
  quantity: number = 1
): Promise<boolean> {
  await getOrCreateUser(userId);
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
    include: { famille: true },
  });

  if (!user) return false;

  if (user.famille_id && user.famille) {
    const inventory = user.famille.inventaire_commun as Record<string, number>;
    if (!inventory[itemName] || inventory[itemName] < quantity) return false;

    inventory[itemName] -= quantity;
    if (inventory[itemName] <= 0) delete inventory[itemName];

    await prisma.famille.update({
      where: { id: user.famille_id },
      data: { inventaire_commun: inventory },
    });
  } else {
    const inventory = user.inventaire as Record<string, number>;
    if (!inventory[itemName] || inventory[itemName] < quantity) return false;

    inventory[itemName] -= quantity;
    if (inventory[itemName] <= 0) delete inventory[itemName];

    await prisma.user.update({
      where: { discordId: userId },
      data: { inventaire: inventory },
    });
  }

  return true;
}

/**
 * Obtient la configuration globale
 */
export async function getConfig() {
  let config = await prisma.config.findFirst();
  
  if (!config) {
    config = await prisma.config.create({
      data: {},
    });
  }

  return config;
}

import { prisma } from '../../db/prisma';
import { calculateDragonPower } from '../../utils/powerCalculation';

/**
 * 🐉 DRAGON HANDLERS - Système Sombre de Dragons & Squelettes
 * Gère les états dragons (Vivant, Squelette, Incinéré)
 * Respecte les mécaniques Dark Fantasy
 */

/**
 * Génère un nouveau dragon aléatoire
 */
export function generateRandomDragon() {



  return {

    tiers: 'T1',
    niveau: 1,
    faim: 100,
    energie_combat: 100,
    etat: 'Vivant',
    age_en_jours: 0,
  };
}

/**
 * Crée un nouveau dragon pour l'utilisateur
 */
export async function createDragon(owner_id: string) {
  const dragonData = generateRandomDragon();

  const dragon = await prisma.dragon.create({
    data: {
      owner_id,
      ...dragonData,
      puissance: calculateDragonPower('T1', 1),
    },
  });

  return dragon;
}

/**
 * Obtient tous les dragons d'un utilisateur
 */
export async function getUserDragons(owner_id: string) {
  return prisma.dragon.findMany({
    where: { owner_id },
    orderBy: { tiers: 'desc' },
  });
}

/**
 * Marquer un dragon comme Squelette (état inerte gelé)
 * Le dragon ne peut plus combattre mais reste en DB
 */
export async function markDragonAsSkeleton(dragonId: string) {
  return await prisma.dragon.update({
    where: { id: dragonId },
    data: {
      etat: 'Squelette',
      faim: 0,
      energie_combat: 0,
    },
  });
}

/**
 * Marquer un dragon comme Incinéré (suppression définitive)
 * Le dragon est complètement retiré du jeu
 */
export async function markDragonAsIncinerated(dragonId: string) {
  return await prisma.dragon.update({
    where: { id: dragonId },
    data: {
      etat: 'Incinéré',
      faim: 0,
      energie_combat: 0,
    },
  });
}

/**
 * Vérifier si un dragon est vivant et peut combattre
 */
export async function isDragonAlive(dragonId: string): Promise<boolean> {
  const dragon = await prisma.dragon.findUnique({
    where: { id: dragonId },
  });

  return dragon?.etat === 'Vivant';
}

/**
 * Récupérer tous les dragons vivants d'un utilisateur (pour combat)
 */
export async function getAliveDragonsForUser(userId: string) {
  return await prisma.dragon.findMany({
    where: {
      owner_id: userId,
      etat: 'Vivant',
    },
  });
}

/**
 * Nourrit un dragon
 * Dragon doit être Vivant
 * Coûte 100💰, restaure faim à 100%
 */
export async function feedDragon(dragon_id: string, foodQuantity: number) {
  const dragon = await prisma.dragon.findUnique({
    where: { id: dragon_id },
  });

  if (!dragon) return null;
  if (dragon.etat !== 'Vivant') {
    throw new Error(`☠️ CRÉATURE INERTE - Dragon en état "${dragon.etat}"`);
  }

  const newFaim = Math.min(100, dragon.faim + foodQuantity);

  return prisma.dragon.update({
    where: { id: dragon_id },
    data: { faim: newFaim },
  });
}

/**
 * Soigne un dragon avec potion
 * Restaure faim + énergie à 100%
 * Coûte 1x artefact magique (Élixir de Restauration)
 */
export async function healDragon(dragon_id: string) {
  const dragon = await prisma.dragon.findUnique({
    where: { id: dragon_id },
  });

  if (!dragon) return null;
  if (dragon.etat !== 'Vivant') {
    throw new Error(`☠️ CRÉATURE INERTE - Impossible de soigner un Squelette`);
  }

  return prisma.dragon.update({
    where: { id: dragon_id },
    data: {
      faim: 100,
      energie_combat: 100,
    },
  });
}

/**
 * Réanimer un Squelette en utilisant un Incubateur Sacré
 * Restaure faim + énergie à 50% (faible réveil)
 * Nécessite l'artefact magique pour fonctionner
 */
export async function reviveDragon(dragon_id: string, userId: string) {
  const dragon = await prisma.dragon.findUnique({
    where: { id: dragon_id },
  });

  if (!dragon) throw new Error('Dragon non trouvé');
  if (dragon.etat !== 'Squelette') {
    throw new Error('Dragon déjà vivant ou incinéré');
  }

  // Vérifier que l'utilisateur a un Incubateur
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  const inventaire = user.inventaire as Record<string, number>;
  const incubators = inventaire['Incubateur Sacré'] || 0;

  if (incubators < 1) {
    throw new Error('Pas assez d\'Incubateurs Sacrés (coûte 1x 🔮)');
  }

  // Consommer l'Incubateur
  inventaire['Incubateur Sacré'] -= 1;

  // Réanimer le dragon
  const revivedDragon = await prisma.dragon.update({
    where: { id: dragon_id },
    data: {
      etat: 'Vivant',
      faim: 50,
      energie_combat: 50,
    },
  });

  // Mettre à jour l'inventaire
  await prisma.user.update({
    where: { discordId: userId },
    data: {
      inventaire: inventaire as any,
    },
  });

  return revivedDragon;
}

/**
 * Réduit la faim de tous les dragons (cron job)
 * Si faim → 0, dragon devient Squelette (morte)
 */
export async function reduceAllDragonsHunger(amount: number = 2) {
  const dragons = await prisma.dragon.findMany({
    where: { etat: 'Vivant' },
  });

  for (const dragon of dragons) {
    const newFaim = Math.max(0, dragon.faim - amount);
    const newEtat = newFaim === 0 ? 'Squelette' : 'Vivant';

    await prisma.dragon.update({
      where: { id: dragon.id },
      data: {
        faim: newFaim,
        etat: newEtat,
      },
    });
  }

  return dragons.length;
}

/**
 * Augmente l'énergie de tous les dragons (cron job)
 */
export async function restoreAllDragonsEnergy(amount: number = 5) {
  const dragons = await prisma.dragon.findMany({
    where: { etat: 'Vivant' },
  });

  for (const dragon of dragons) {
    const newEnergy = Math.min(100, dragon.energie_combat + amount);

    await prisma.dragon.update({
      where: { id: dragon.id },
      data: { energie_combat: newEnergy },
    });
  }

  return dragons.length;
}

/**
 * Augmente l'age de todos dragons et les fait évoluer (cron job)
 * T1 → T2 à 14 jours
 * T2 → T3 à 30 jours
 */
export async function ageAndEvolveDragons() {
  const dragons = await prisma.dragon.findMany();

  for (const dragon of dragons) {
    const newAge = dragon.age_en_jours + 1;
    let newTiers = dragon.tiers;

    if (dragon.tiers === 'T1' && newAge >= 14) {
      newTiers = 'T2';
    } else if (dragon.tiers === 'T2' && newAge >= 30) {
      newTiers = 'T3';
    }

    const newPuissance = calculateDragonPower(newTiers, dragon.niveau + (newTiers !== dragon.tiers ? 1 : 0));

    await prisma.dragon.update({
      where: { id: dragon.id },
      data: {
        age_en_jours: newAge,
        tiers: newTiers,
        puissance: newPuissance,
      },
    });
  }

  return dragons.length;
}

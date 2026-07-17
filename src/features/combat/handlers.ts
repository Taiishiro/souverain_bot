import { prisma } from '../../db/prisma';
import { getConfig } from '../../utils/gameConfig';
import {
  calculateDragonPower,
  calculateTotalArmyPower,
  calculateCombatResult,
  calculateMoneyStealing,
} from '../../utils/powerCalculation';

export interface CombatResult {
  mode: 'pillage' | 'siege';
  conquered_royaume?: any;
  damage_royaume?: boolean;
  attacker_won: boolean;
  multiplier: number;
  money_stolen: bigint;
  dragons_killed: number;
  puines_killed: number;
  attacker_miracle: boolean;
  defender_miracle: boolean;
  attacker_final_power: number;
  defender_final_power: number;
  killed_dragon_names: string[];

  attacker_base_power: number;
  defender_base_power: number;
}

/**
 * Exécute un combat entre deux utilisateurs
 */

export async function executeCombat(
  attacker_id: string,
  defender_id: string,
  selected_dragon_ids: string[],
  mode: 'pillage' | 'siege' = 'pillage',
  target_royaume_id?: string
): Promise<CombatResult | null> {
  return await prisma.$transaction(async (tx) => {
    const attacker = await tx.user.findUnique({
      where: { id: attacker_id },
      include: { famille: { include: { membres: true } } }
    });
    const defender = await tx.user.findUnique({
      where: { id: defender_id },
      include: { famille: { include: { membres: true } } }
    });

    if (!attacker || !defender) throw new Error("Combattants introuvables");

    const attacker_dragons = await tx.dragon.findMany({
      where: { id: { in: selected_dragon_ids }, owner_id: attacker_id, etat: 'Vivant' },
    });
    if (attacker_dragons.length === 0) throw new Error("Aucun dragon valide.");

    let defender_dragons = await tx.dragon.findMany({
      where: { owner_id: defender_id, etat: 'Vivant' },
    });
    
    // Si pas de dragons, chercher ceux du conjoint
    if (defender_dragons.length === 0 && defender.famille) {
       const partner = defender.famille.membres.find(m => m.discordId !== defender_id);
       if (partner) {
           defender_dragons = await tx.dragon.findMany({
              where: { owner_id: partner.id, etat: 'Vivant' },
           });
       }
    }

    let attacker_royaumes = await tx.royaume.findMany({ where: { owner_id: attacker_id } });
    if (attacker_royaumes.length === 0 && attacker.famille) {
        const partner = attacker.famille.membres.find(m => m.discordId !== attacker_id);
        if (partner) attacker_royaumes = await tx.royaume.findMany({ where: { owner_id: partner.id } });
    }

    let defender_royaumes = await tx.royaume.findMany({ where: { owner_id: defender_id } });
    if (defender_royaumes.length === 0 && defender.famille) {
        const partner = defender.famille.membres.find(m => m.discordId !== defender_id);
        if (partner) defender_royaumes = await tx.royaume.findMany({ where: { owner_id: partner.id } });
    }

    const attackerInv = (attacker.famille_id ? attacker.famille?.inventaire_commun : attacker.inventaire) as Record<string, number> || {};
    const defenderInv = (defender.famille_id ? defender.famille?.inventaire_commun : defender.inventaire) as Record<string, number> || {};

    const attackerPuines = attackerInv['Puîné'] || 0;
    const defenderPuines = defenderInv['Puîné'] || 0;

    let base_attacker_power = attacker_dragons.reduce((acc, d) => acc + (d.puissance || 0), 0) + attackerPuines;
    let base_defender_power = defender_dragons.reduce((acc, d) => acc + (d.puissance || 0), 0) + defenderPuines;

    base_attacker_power += attacker_royaumes.length * 10;
    base_defender_power += defender_royaumes.length * 10;
    
    // Miracles
    const attacker_miracle = Math.random() < 0.05;
    const defender_miracle = Math.random() < 0.05;

    let attacker_final_power = base_attacker_power * (attacker_miracle ? 1.5 : 1.0);
    let defender_final_power = base_defender_power * (defender_miracle ? 1.5 : 1.0);

    const purgeEndTimeStr = await getConfig('purge_end_time', '0');
    const isPurgeActive = parseInt(purgeEndTimeStr) > Date.now();

    if (mode === 'siege') {
        // Bonus terrain uniquement s'il n'y a pas de purge en cours
        if (!isPurgeActive) {
            defender_final_power = defender_final_power * 1.2;
        }
    }

    const win_prob = attacker_final_power / (attacker_final_power + defender_final_power || 1);
    const won = Math.random() < win_prob;

    const multiplier = won ? attacker_final_power / (defender_final_power || 1) : defender_final_power / (attacker_final_power || 1);

    let conquered_royaume: any = undefined;
    let damage_royaume: boolean = false;

    let money_stolen = BigInt(0);
    let dragons_killed = 0;
    let puines_killed = 0;
    let killed_dragon_names: string[] = [];

    // Helper to calculate stolen money
    const calcStolen = (balance: bigint, percent: number) => {
        const stolen = (balance * BigInt(percent)) / BigInt(100);
        return stolen > balance ? balance : stolen;
    };

    if (won) {
        let moneyPool = defender.famille_id && defender.famille ? defender.famille.argent_commun : defender.argent_perso;
        const percent = mode === 'siege' ? 10 : 75;
        money_stolen = calcStolen(moneyPool, percent);

        if (defender.famille_id && defender.famille) {
            await tx.famille.update({ where: { id: defender.famille_id }, data: { argent_commun: { decrement: money_stolen } } });
        } else {
            await tx.user.update({ where: { id: defender_id }, data: { argent_perso: { decrement: money_stolen } } });
        }

        if (attacker.famille_id && attacker.famille) {
            await tx.famille.update({ where: { id: attacker.famille_id }, data: { argent_commun: { increment: money_stolen } } });
        } else {
            await tx.user.update({ where: { id: attacker_id }, data: { argent_perso: { increment: money_stolen } } });
        }


        if (mode === 'siege' && defender_royaumes.length > 0) {
             const targetRoyaume = target_royaume_id && defender_royaumes.find(r => r.id === target_royaume_id) 
                ? defender_royaumes.find(r => r.id === target_royaume_id)!
                : defender_royaumes[0];
             damage_royaume = true;
             let newPv = Math.max(0, (targetRoyaume.pv || 3) - 1);
             
             if (newPv === 0) {
                 // Conquête réussie !
                 await tx.royaume.update({
                     where: { id: targetRoyaume.id },
                     data: { pv: targetRoyaume.max_pv || 3, owner_id: attacker_id }
                 });
                 // Transfer discord integration to new owner is handled in command
                 conquered_royaume = { ...targetRoyaume, pv: targetRoyaume.max_pv || 3 };
             } else {
                 // Dégât simple
                 await tx.royaume.update({
                     where: { id: targetRoyaume.id },
                     data: { pv: newPv }
                 });
                 conquered_royaume = { ...targetRoyaume, pv: newPv };
             }
        }

        if (multiplier >= 1.2 && Math.random() > 0.5) {
            if (defenderPuines > 0) {
                const lost = Math.max(1, Math.floor(defenderPuines * (0.1 + Math.random() * 0.4)));
                puines_killed += lost;
                const newInv = { ...defenderInv };
                newInv['Puîné'] = Math.max(0, defenderPuines - lost);
                if (newInv['Puîné'] === 0) delete newInv['Puîné'];
                if (defender.famille_id) {
                    await tx.famille.update({ where: { id: defender.famille_id }, data: { inventaire_commun: newInv } });
                } else {
                    await tx.user.update({ where: { id: defender_id }, data: { inventaire: newInv } });
                }
            } else if (defender_dragons.length > 0) {
                const target = defender_dragons[Math.floor(Math.random() * defender_dragons.length)];
                await tx.dragon.update({ where: { id: target.id }, data: { etat: 'Squelette' } });
                dragons_killed++;
                killed_dragon_names.push(`Dragon ${target.tiers}`);
            }
        }
    } else {
        let moneyPool = attacker.famille_id && attacker.famille ? attacker.famille.argent_commun : attacker.argent_perso;
        const percent = mode === 'siege' ? 10 : 75;
        money_stolen = calcStolen(moneyPool, percent);

        if (attacker.famille_id && attacker.famille) {
            await tx.famille.update({ where: { id: attacker.famille_id }, data: { argent_commun: { decrement: money_stolen } } });
        } else {
            await tx.user.update({ where: { id: attacker_id }, data: { argent_perso: { decrement: money_stolen } } });
        }

        if (defender.famille_id && defender.famille) {
            await tx.famille.update({ where: { id: defender.famille_id }, data: { argent_commun: { increment: money_stolen } } });
        } else {
            await tx.user.update({ where: { id: defender_id }, data: { argent_perso: { increment: money_stolen } } });
        }

        if (multiplier >= 1.2 && Math.random() > 0.5) {
             if (attackerPuines > 0) {
                const lost = Math.max(1, Math.floor(attackerPuines * (0.1 + Math.random() * 0.4)));
                puines_killed += lost;
                const newInv = { ...attackerInv };
                newInv['Puîné'] = Math.max(0, attackerPuines - lost);
                if (newInv['Puîné'] === 0) delete newInv['Puîné'];
                if (attacker.famille_id) {
                    await tx.famille.update({ where: { id: attacker.famille_id }, data: { inventaire_commun: newInv } });
                } else {
                    await tx.user.update({ where: { id: attacker_id }, data: { inventaire: newInv } });
                }
            } else if (attacker_dragons.length > 0) {
                const target = attacker_dragons[Math.floor(Math.random() * attacker_dragons.length)];
                await tx.dragon.update({ where: { id: target.id }, data: { etat: 'Squelette' } });
                dragons_killed++;
                killed_dragon_names.push(`Dragon ${target.tiers}`);
            }
        }
    }

    // Réduire l'énergie
    for (const dragon of attacker_dragons) {
        await tx.dragon.update({ where: { id: dragon.id }, data: { energie_combat: Math.max(0, dragon.energie_combat - 50) } });
    }

    return {
        attacker_won: won,
        multiplier,
        money_stolen,
        puines_killed,
        dragons_killed,
        attacker_miracle,
        defender_miracle,
        attacker_final_power,
        defender_final_power,
        killed_dragon_names,
        attacker_base_power: base_attacker_power,
        defender_base_power: base_defender_power,
        mode,
        conquered_royaume,
        damage_royaume,
    };
  });
}
/**
 * Effectue un sabotage
 */
export async function performSabotage(
  attacker_id: string,
  defender_id: string
): Promise<{ success: boolean; dragon_sabotaged?: string }> {
  const defender_dragons = await prisma.dragon.findMany({
    where: {
      owner_id: defender_id,
      etat: 'Vivant',
    },
  });

  if (defender_dragons.length === 0) {
    return { success: false };
  }

  // Sélectionner un dragon aléatoire
  const target_dragon = defender_dragons[Math.floor(Math.random() * defender_dragons.length)];

  // RNG based on tier
  const rng = Math.random() * 100;
  const success_chance = target_dragon.tiers === 'T3' ? 80 : target_dragon.tiers === 'T2' ? 50 : 30;

  if (rng > success_chance) {
    return { success: false };
  }

  // Sabotage réussi: réduire puissance de 25% pendant 12h
  const original_power = target_dragon.puissance;
  const damaged_power = Math.floor(original_power * 0.75);

  await prisma.dragon.update({
    where: { id: target_dragon.id },
    data: { puissance: damaged_power },
  });

  // TODO: Implémenter un système de "debuff temporaire" pour restaurer à 12h

  return {
    success: true,
    dragon_sabotaged: `Dragon ${target_dragon.tiers}`,
  };
}

/**
 * Effectue une perquisition
 */
export async function performPerquisition(
  attacker_id: string,
  defender_id: string
): Promise<{ success: boolean; item_stolen?: string; amount_stolen?: bigint }> {
  const defender_data = await prisma.user.findUnique({
      where: { id: defender_id },
      include: { famille: true, alliance: true },
    });

  if (!defender_data) return { success: false };

  // RNG basé sur la puissance du défenseur (simple pour maintenant)
  const rng = Math.random();

  if (rng > 0.5) {
    return { success: false };
  }

  // Perquisition réussie: voler 10% de l'argent OU 1 item
  const steal_item = Math.random() > 0.5;

  if (steal_item) {
    const inventory = defender_data.famille_id
      ? (defender_data.famille?.inventaire_commun as Record<string, number>)
      : (defender_data.inventaire as Record<string, number>);

    const items = Object.keys(inventory).filter((k) => inventory[k] > 0);

    if (items.length > 0) {
      const stolen_item = items[Math.floor(Math.random() * items.length)];

      // Retirer l'item
      if (defender_data.famille_id) {
        const inv = defender_data.famille!.inventaire_commun as Record<string, number>;
        inv[stolen_item]--;
        if (inv[stolen_item] <= 0) delete inv[stolen_item];

        await prisma.famille.update({
          where: { id: defender_data.famille_id },
          data: { inventaire_commun: inv },
        });
      } else {
        const inv = defender_data.inventaire as Record<string, number>;
        inv[stolen_item]--;
        if (inv[stolen_item] <= 0) delete inv[stolen_item];

        await prisma.user.update({
          where: { id: defender_id },
          data: { inventaire: inv },
        });
      }

      
      // DONNER L'ITEM A L'ATTAQUANT
      const attacker_data = await prisma.user.findUnique({
        where: { id: attacker_id },
        include: { famille: true }
      });
      if (attacker_data) {
        if (attacker_data.famille_id) {
          const aInv = attacker_data.famille.inventaire_commun as Record<string, number> || {};
          aInv[stolen_item] = (aInv[stolen_item] || 0) + 1;
          await prisma.famille.update({
            where: { id: attacker_data.famille_id },
            data: { inventaire_commun: aInv }
          });
        } else {
          const aInv = attacker_data.inventaire as Record<string, number> || {};
          aInv[stolen_item] = (aInv[stolen_item] || 0) + 1;
          await prisma.user.update({
            where: { id: attacker_id },
            data: { inventaire: aInv }
          });
        }
      }

      return { success: true, item_stolen: stolen_item };
    }
  }

  // Voler 10% d'argent
  const target_money = defender_data.famille_id
    ? defender_data.famille?.argent_commun || BigInt(0)
    : defender_data.argent_perso || BigInt(0);

  const amount_stolen = (target_money * BigInt(10)) / BigInt(100);

  if (defender_data.famille_id) {
    await prisma.famille.update({
      where: { id: defender_data.famille_id },
      data: { argent_commun: { decrement: amount_stolen } },
    });
  } else {
    await prisma.user.update({
      where: { id: defender_id },
      data: { argent_perso: { decrement: amount_stolen } },
    });
  }

  
  // DONNER L'ARGENT A L'ATTAQUANT
  const attacker_data = await prisma.user.findUnique({ where: { id: attacker_id } });
  if (attacker_data) {
    if (attacker_data.famille_id) {
       await prisma.famille.update({
         where: { id: attacker_data.famille_id },
         data: { argent_commun: { increment: amount_stolen } }
       });
    } else {
       await prisma.user.update({
         where: { id: attacker_id },
         data: { argent_perso: { increment: amount_stolen } }
       });
    }
  }

  return { success: true, amount_stolen };
}

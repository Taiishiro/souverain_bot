/**
 * Calcule la puissance d'un dragon selon son tier et son niveau
 * Formule: 1×T3 = 2×T2 = 4×T1
 */
export function calculateDragonPower(tiers: string, niveau: number, baseMultiplier: number = 10): number {
  const tierMultiplier: Record<string, number> = {
    T3: 4, // Légendaire
    T2: 2, // Rare
    T1: 1, // Commun
  };

  const multiplier = tierMultiplier[tiers] || 1;
  return multiplier * niveau * baseMultiplier;
}

/**
 * Calcule la puissance totale d'une armée de dragons
 */
export function calculateTotalArmyPower(dragons: Array<{ tiers: string; niveau: number }>): number {
  return dragons.reduce((total, dragon) => {
    return total + calculateDragonPower(dragon.tiers, dragon.niveau);
  }, 0);
}

/**
 * Détermine le résultat du combat (pourcentage)
 * Retourne le multiplicateur de victoire
 */
export function calculateCombatResult(
  attackerPower: number,
  defenderPower: number
): { won: boolean; multiplier: number } {
  if (attackerPower === 0 || defenderPower === 0) {
    return { won: false, multiplier: 0 };
  }

  const multiplier = attackerPower / defenderPower;
  const won = multiplier > 1.2; // Faut être > 1.2x plus fort pour gagner

  return { won, multiplier };
}

/**
 * Calcule le montant d'argent à voler
 */
export function calculateMoneyStealing(
  targetMoney: bigint,
  percentage: number = 75
): bigint {
  return (targetMoney * BigInt(percentage)) / BigInt(100);
}

/**
 * Calcule les cotes dynamiques d'un pari
 * Cote pour les gagnants = Total_mises / Mises_gagnantes
 */
export function calculateDynamicOdds(
  totalBets: bigint,
  winnerBets: bigint
): number {
  if (winnerBets === BigInt(0)) return 0;
  return Number((totalBets * BigInt(100)) / winnerBets) / 100;
}

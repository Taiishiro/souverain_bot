import { prisma } from '../db/prisma';

/**
 * Vérifie si un utilisateur a un cooldown actif pour une action
 */
export async function hasCooldown(
  userId: string,
  action: string
): Promise<boolean> {
  const cooldown = await prisma.cooldown.findUnique({
    where: {
      user_id_action: {
        user_id: userId,
        action,
      },
    },
  });

  if (!cooldown) return false;

  if (new Date() > cooldown.expire_at) {
    // Cooldown expiré, le supprimer
    await prisma.cooldown.delete({
      where: {
        user_id_action: {
          user_id: userId,
          action,
        },
      },
    });
    return false;
  }

  return true;
}

/**
 * Crée un cooldown pour un utilisateur
 */
export async function setCooldown(
  userId: string,
  action: string,
  hours: number
): Promise<void> {
  const expireAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await prisma.cooldown.upsert({
    where: {
      user_id_action: {
        user_id: userId,
        action,
      },
    },
    create: {
      user_id: userId,
      action,
      expire_at: expireAt,
    },
    update: {
      expire_at: expireAt,
    },
  });
}

/**
 * Obtient le temps restant d'un cooldown (en millisecondes)
 */
export async function getCooldownTimeRemaining(
  userId: string,
  action: string
): Promise<number | null> {
  const cooldown = await prisma.cooldown.findUnique({
    where: {
      user_id_action: {
        user_id: userId,
        action,
      },
    },
  });

  if (!cooldown) return null;

  const remaining = cooldown.expire_at.getTime() - Date.now();
  return remaining > 0 ? remaining : null;
}

/**
 * Formate le temps en format lisible (ex: "2h 30m")
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

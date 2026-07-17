import { GuildMember } from 'discord.js';
import { prisma } from '../db/prisma';

/**
 * Vérifie si un membre a les permissions d'administrateur du bot
 * @param member Le membre Discord à vérifier
 * @returns true si le membre est admin, false sinon
 */
export async function hasAdminPermissions(member: GuildMember): Promise<boolean> {
  try {
    // Le propriétaire du serveur a toujours accès
    if (member.guild.ownerId === member.id) {
      return true;
    }

    // Récupérer le rôle admin configuré
    const adminConfig = await prisma.gameConfig.findUnique({
      where: { key: 'admin_role_id' }
    });

    if (!adminConfig) {
      // Si aucun rôle n'est configuré, seul le propriétaire peut agir
      return false;
    }

    // Vérifier si le membre a le rôle configuré
    return member.roles.cache.has(adminConfig.value);
  } catch (error) {
    console.error('Erreur vérification permissions admin:', error);
    return false;
  }
}

/**
 * Récupère l'ID du rôle administrateur configuré
 * @returns L'ID du rôle admin ou null si non configuré
 */
export async function getAdminRoleId(): Promise<string | null> {
  try {
    const adminConfig = await prisma.gameConfig.findUnique({
      where: { key: 'admin_role_id' }
    });
    return adminConfig?.value || null;
  } catch (error) {
    console.error('Erreur récupération rôle admin:', error);
    return null;
  }
}
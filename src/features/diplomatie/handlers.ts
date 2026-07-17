import { prisma } from '../../db/prisma';

/**
 * Crée une famille
 */
export async function createFamille(nom: string, chef_id: string) {
  return prisma.famille.create({
    data: {
      nom,
      chef_id,
      argent_commun: BigInt(0),
      inventaire_commun: {},
    },
  });
}

/**
 * Obtient une famille par ID
 */
export async function getFamilleById(id: string) {
  return prisma.famille.findUnique({
    where: { id },
    include: { membres: true },
  });
}

/**
 * Obtient une famille par utilisateur
 */
export async function getFamilleByUser(user_id: string) {
  const user = await prisma.user.findUnique({
    where: { id: user_id },
    include: { famille: { include: { membres: true } } },
  });

  return user?.famille || null;
}

/**
 * Ajoute un utilisateur à une famille
 */
export async function addUserToFamille(user_id: string, famille_id: string) {
  return prisma.user.update({
    where: { id: user_id },
    data: { famille_id },
  });
}

/**
 * Retire un utilisateur d'une famille
 */
export async function removeUserFromFamille(user_id: string) {
  return prisma.user.update({
    where: { id: user_id },
    data: { famille_id: null },
  });
}

/**
 * Renomme une famille
 */
export async function renameFamille(famille_id: string, newName: string) {
  return prisma.famille.update({
    where: { id: famille_id },
    data: { nom: newName },
  });
}

/**
 * Supprime une famille
 */
export async function deleteFamille(famille_id: string) {
  // Enlever tous les membres
  await prisma.user.updateMany({
    where: { famille_id },
    data: { famille_id: null },
  });

  // Supprimer la famille
  return prisma.famille.delete({
    where: { id: famille_id },
  });
}

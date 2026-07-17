import { prisma } from '../db/prisma';

export interface UserData {
  argent: bigint;
  argentRecord: bigint;
  inventaire: Record<string, any>;
  source: 'user' | 'famille' | 'alliance';
  famille_id?: string;
  alliance_id?: string;
  user_id: string;
}

/**
 * Récupère les données financières d'un utilisateur
 * Si l'user a une famille, retourne les données COMMUNES
 * Sinon, retourne ses données PERSONNELLES
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  const user = await prisma.user.findUnique({
    where: { discordId: userId },
    include: { famille: true, alliance: true },
  });

  if (!user) return null;

  // Si le joueur est dans une alliance
  if (user.alliance_id && (user as any).alliance) {
    const alliance = (user as any).alliance;
    return {
      argent: alliance.argent_commun,
      argentRecord: alliance.argent_record || BigInt(0),
      inventaire: alliance.inventaire_commun as Record<string, any>,
      source: 'alliance',
      alliance_id: user.alliance_id,
      user_id: user.id,
    };
  }

  // Si l'utilisateur a une famille
  if (user.famille_id && user.famille) {
    return {
      argent: user.famille.argent_commun,
      argentRecord: user.famille.argent_record || BigInt(0),
      inventaire: user.famille.inventaire_commun as Record<string, any>,
      source: 'famille',
      famille_id: user.famille_id,
      user_id: user.id,
    };
  }

  // Sinon, données personnelles
  return {
    argent: user.argent_perso,
    argentRecord: user.argent_record,
    inventaire: user.inventaire as Record<string, any>,
    source: 'user',
    user_id: user.id,
  };
}

/**
 * Transfère de l'argent d'un utilisateur à un autre
 * Applique la taxe automatiquement
 */
export async function paiement(
  sender_discord_id: string,
  receiver_discord_id: string,
  montant: bigint,
  taxe_percent: number = 5
): Promise<boolean> {
  const sender = await getUserData(sender_discord_id);
  if (!sender || sender.argent < montant) return false;

  const taxe = (montant * BigInt(taxe_percent)) / BigInt(100);
  const montant_net = montant - taxe;

  // Débit de l'envoyeur
  if (sender.source === 'alliance') {
    await prisma.alliance.update({
      where: { id: sender.alliance_id },
      data: { argent_commun: { decrement: montant } },
    });
  } else if (sender.source === 'famille') {
    await prisma.famille.update({
      where: { id: sender.famille_id },
      data: { argent_commun: { decrement: montant } },
    });
  } else {
    await prisma.user.update({
      where: { discordId: sender_discord_id },
      data: { argent_perso: { decrement: montant } },
    });
  }

  // Crédit au receveur
  const receiver = await getUserData(receiver_discord_id);
  if (receiver?.source === 'alliance') {
    await prisma.alliance.update({
      where: { id: receiver.alliance_id },
      data: { argent_commun: { increment: montant_net } },
    });
    
  } else if (receiver?.source === 'famille') {
    await prisma.famille.update({
      where: { id: receiver.famille_id },
      data: { argent_commun: { increment: montant_net } },
    });
    
    // Mettre à jour argent record
    const newMontant = receiver.argent + montant_net;                                                                                                                                
    if (newMontant > receiver.argentRecord) {
      await prisma.famille.update({
        where: { id: receiver.famille_id },
        data: { argent_record: newMontant }
      });
    }

  } else if (receiver) {
    const newMontant = receiver.argent + montant_net;
    await prisma.user.update({
      where: { discordId: receiver_discord_id },
      data: { 
        argent_perso: { increment: montant_net },
        argent_record: newMontant > receiver.argentRecord ? newMontant : receiver.argentRecord
      },
    });
  }

  return true;
}

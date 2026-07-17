import { prisma } from '../../db/prisma';

export async function buyShopItemTransaction(userId: string, itemName: string, price: bigint) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { discordId: userId },
      include: { famille: true },
    });

    if (!user) throw new Error("Joueur introuvable.");

    if (user.famille_id && user.famille) {
      if (user.famille.argent_commun < price) throw new Error("Fonds insuffisants dans le trésor commun.");

      const inv = user.famille.inventaire_commun as Record<string, number> || {};
      inv[itemName] = (inv[itemName] || 0) + 1;

      await tx.famille.update({
        where: { id: user.famille_id },
        data: {
          argent_commun: { decrement: price },
          inventaire_commun: inv,
        },
      });
    } else {
      if (user.argent_perso < price) throw new Error("Fonds insuffisants.");

      const inv = user.inventaire as Record<string, number> || {};
      inv[itemName] = (inv[itemName] || 0) + 1;

      await tx.user.update({
        where: { discordId: userId },
        data: {
          argent_perso: { decrement: price },
          inventaire: inv,
        },
      });
    }
    return true;
  });
}

export async function buyItemWithEffectsTransaction(userId: string, itemId: string, kingdomNameBase: string) {
  return await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({
      where: { discordId: userId },
      include: { famille: true },
    });

    if (!user) {
        user = await tx.user.create({ data: { discordId: userId, argent_perso: BigInt(0), inventaire: {} }, include: { famille: true } });
    }

    const item = await tx.shopItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Cet item n'existe plus.");

    if (item.stock !== -1 && item.stock <= 0) throw new Error("Cet item n'est plus en stock.");

    // Verifier fonds
    let moneyPool = user.famille_id && user.famille ? user.famille.argent_commun : user.argent_perso;
    if (moneyPool < item.prix) {
        throw new Error(`Fonds insuffisants. Il vous faut ${item.prix}💰.`);
    }

    // Retirer argent
    if (user.famille_id && user.famille) {
        await tx.famille.update({
            where: { id: user.famille_id },
            data: { argent_commun: { decrement: item.prix } }
        });
    } else {
        await tx.user.update({
            where: { discordId: userId },
            data: { argent_perso: { decrement: item.prix } }
        });
    }

    let resultData: any = { type: item.type, item: item };

    if (item.type === 'dragon') {
        const dragonData = (item.effet_json as any) || {};
        await tx.dragon.create({
          data: {
            owner_id: user.id,
            tiers: dragonData.tiers || 'T1',
            niveau: dragonData.niveau || 1,
            puissance: dragonData.puissance || 10,
          },
        });
    } else if (item.type === 'royaume') {
        // Just add it to inventory so player can use /royaume
        if (user.famille_id && user.famille) {
            const inv = user.famille.inventaire_commun as Record<string, number> || {};
            inv[item.nom] = (inv[item.nom] || 0) + 1;
            await tx.famille.update({
                where: { id: user.famille_id },
                data: { inventaire_commun: inv }
            });
        } else {
            const inv = user.inventaire as Record<string, number> || {};
            inv[item.nom] = (inv[item.nom] || 0) + 1;
            await tx.user.update({
                where: { discordId: userId },
                data: { inventaire: inv }
            });
        }
        resultData.type = 'inventaire'; // treat it as normal

    } else {
        // Inventaire classique
        if (user.famille_id && user.famille) {
            const inv = user.famille.inventaire_commun as Record<string, number> || {};
            inv[item.nom] = (inv[item.nom] || 0) + 1;
            await tx.famille.update({
                where: { id: user.famille_id },
                data: { inventaire_commun: inv }
            });
        } else {
            const inv = user.inventaire as Record<string, number> || {};
            inv[item.nom] = (inv[item.nom] || 0) + 1;
            await tx.user.update({
                where: { discordId: userId },
                data: { inventaire: inv }
            });
        }
    }

    if (item.stock !== -1) {
        await tx.shopItem.update({
            where: { id: itemId },
            data: { stock: { decrement: 1 } }
        });
    }

    return resultData;
  });
}

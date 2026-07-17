import { prisma } from '../../db/prisma';

export async function initializeShopItems() {
  try {
    const shopItems = [
      { nom: 'Dragon T1', type: 'dragon', prix: BigInt(100000), effet_json: { tiers: 'T1', niveau: 1, puissance: 10 }, },
      { nom: 'Dragon T2', type: 'dragon', prix: BigInt(450000), effet_json: { tiers: 'T2', niveau: 1, puissance: 30 }, },
      { nom: 'Dragon T3', type: 'dragon', prix: BigInt(2500000), effet_json: { tiers: 'T3', niveau: 1, puissance: 60 }, },
      { nom: 'Puîné', type: 'puine', prix: BigInt(5000), effet_json: { puissance: 1 }, },
      { nom: 'Jeune Dragon T1', type: 'Dragon_Egg', prix: BigInt(40000), effet_json: {}, },
      { nom: 'Incubateur', type: 'Incubateur', prix: BigInt(75000), effet_json: {}, },
      { nom: "Potion d'Énergie", type: 'Consommable', prix: BigInt(15000), effet_json: {}, },
      { nom: 'Potion de Faim', type: 'Consommable', prix: BigInt(15000), effet_json: {}, },
      { nom: "Cristal d'Expérience", type: 'Essence', prix: BigInt(50000), effet_json: {}, },
      { nom: 'Potion de Puissance', type: 'Consommable', prix: BigInt(60000), effet_json: {}, },
      { nom: 'Élixir de Combat', type: 'Consommable', prix: BigInt(100000), effet_json: {}, },
      { nom: 'Mandat de Perquisition', type: 'artefact', prix: BigInt(150000), effet_json: { description: 'Permet de perquisitionner et piller un joueur.' }, },
      { nom: "Mandat d'Emprisonnement", type: 'artefact', prix: BigInt(500000), effet_json: { description: 'Nécessaire pour emprisonner un joueur dans le cachot.' }, },
      { nom: 'Pacte de Sang', type: 'artefact', prix: BigInt(750000), effet_json: { description: 'Nécessaire pour fonder une Alliance.' }, },
      { nom: 'Pierre de Fortification', type: 'artefact', prix: BigInt(400000), effet_json: { description: 'Restaure 1 Vie au Royaume.' }, },
      { nom: 'Royaume Frontalier', type: 'royaume', prix: BigInt(500000), effet_json: { nom_type: 'Frontalier' }, },
      { nom: 'Royaume Principal', type: 'royaume', prix: BigInt(1500000), effet_json: { nom_type: 'Principal' }, }
    ];

    for (const item of shopItems) {
      const existingItem = await prisma.shopItem.findUnique({
        where: { nom: item.nom },
      });

      if (!existingItem) {
        await prisma.shopItem.create({
          data: {
            ...item,
            stock: -1,
          },
        });
        console.log(`✅ Item créé: ${item.nom}`);
      } else {
        await prisma.shopItem.update({
          where: { id: existingItem.id },
          data: { 
            prix: item.prix,
            effet_json: item.effet_json 
          }
        });
      }
    }
    console.log('✅ Items de boutique initialisés');
  } catch (error) {
    console.error('❌ Erreur shop:', error);
  }
}

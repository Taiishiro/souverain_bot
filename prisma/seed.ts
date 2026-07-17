import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: Remplissage de la base de données...');


  // Insérer les items de la boutique (y compris Puîné)
  const items = [
    { nom: 'Jeune Dragon T1', type: 'Dragon_Egg', prix: BigInt(5000), stock: -1 },
    { nom: 'Incubateur', type: 'Incubateur', prix: BigInt(3000), stock: -1 },
    { nom: 'Potion de Faim', type: 'Consommable', prix: BigInt(500), stock: -1 },
    { nom: 'Potion d\'Énergie', type: 'Consommable', prix: BigInt(400), stock: -1 },
    { nom: 'Potion de Puissance', type: 'Consommable', prix: BigInt(2000), stock: -1 },
    { nom: 'Cristal d\'Expérience', type: 'Essence', prix: BigInt(1500), stock: -1 },
    { nom: 'Élixir de Combat', type: 'Consommable', prix: BigInt(2500), stock: -1 },
    { nom: 'Puîné', type: 'puine', prix: BigInt(1000), stock: -1, effet_json: JSON.stringify({ puissance: 1 }) },
  ];

  for (const item of items) {
    await prisma.shopItem.upsert({
      where: { nom: item.nom },
      update: {},
      create: item,
    });
  }

  console.log('✅ Seed terminé!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

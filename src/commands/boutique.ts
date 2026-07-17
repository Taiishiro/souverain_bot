import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType, StringSelectMenuInteraction } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { isFeatureEnabled } from '../utils/gameConfig';
import { errorEmbed } from '../utils/embeds';

const CYBER_GOLD = '#FFD700';

function formatPrice(val: number | bigint): string {
  const num = Number(val);
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'Md';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
  }
  return num.toString();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boutique')
    .setDescription('🛍️ Accéder à l’Échoppe de l’Alchimiste'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const boutiqueEnabled = await isFeatureEnabled('boutique');
      if (!boutiqueEnabled) {
        return await interaction.editReply({
          embeds: [errorEmbed('Fonctionnalité désactivée', '🛒 La boutique est actuellement désactivée par les administrateurs.')],
        });
      }

      await getOrCreateUser(interaction.user.id);
      const items = await prisma.shopItem.findMany();

      if (items.length === 0) {
        return await interaction.editReply({
          content: '❌ L’Échoppe de l’Alchimiste est temporairement fermée.',
        });
      }

      // Group items
      const categories = [
        { label: '🐉 Dragons & Créatures', value: 'creatures', types: ['dragon', 'Dragon_Egg', 'Incubateur'] },
        { label: '🏰 Royaume & Armée', value: 'royaume', types: ['royaume', 'puine'] },
        { label: '🧪 Potions & Consommables', value: 'potions', types: ['Consommable', 'Essence', 'potion'] },
        { label: '📜 Artefacts & Mandats', value: 'artefacts', types: ['artefact'] },
        { label: '📦 Autres', value: 'autres', types: [] } // catch-all
      ];

      const getCategoryItems = (value: string) => {
        const cat = categories.find(c => c.value === value);
        if (!cat) return [];
        if (value === 'autres') {
          const knownTypes = categories.flatMap(c => c.types);
          return items.filter(i => !knownTypes.includes(i.type));
        }
        return items.filter(i => cat.types.includes(i.type));
      };

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_category')
        .setPlaceholder('Choisissez un rayon d’artefacts')
        .addOptions(
          categories.map(c => ({
            label: c.label,
            value: c.value,
          }))
        );

      const rowMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setColor(CYBER_GOLD)
        .setTitle('🛍️ ÉCHOPPE DE L’ALCHIMISTE')
        .setDescription('```css\n🔮 Bienvenue dans l’Échoppe de l’Alchimiste !\n   Sélectionnez un rayon pour voir nos articles.\n```')
        .setFooter({ text: '🔮 Souverain Bot - Échoppe de l’Alchimiste', iconURL: 'https://i.imgur.com/placeholder.png' })
        .setTimestamp();

      const response = await interaction.editReply({
        embeds: [embed],
        components: [rowMenu],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300_000, // 5 minutes
      });

      collector.on('collect', async (i: StringSelectMenuInteraction) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({ content: '❌ Ce menu n\'est pas pour vous!', ephemeral: true });
          return;
        }

        const selectedValue = i.values[0];
        const categoryItems = getCategoryItems(selectedValue);
        const catObj = categories.find(c => c.value === selectedValue);

        const newEmbed = EmbedBuilder.from(embed)
          .setDescription(`\`\`\`css\n🔮 Rayon : ${catObj?.label}\n💡 Cliquez sur un bouton pour acheter.\n\`\`\``);

        if (categoryItems.length === 0) {
           await i.update({
             embeds: [newEmbed],
             components: [rowMenu] // just the menu
           });
           return;
        }

        const rows: ActionRowBuilder<ButtonBuilder>[] = [rowMenu as any];
        let currentRow = new ActionRowBuilder<ButtonBuilder>();
        let buttonCount = 0;

        for (const item of categoryItems) {
          if (buttonCount >= 5) {
            if (rows.length < 5) rows.push(currentRow); // Discord max 5 rows total
            currentRow = new ActionRowBuilder<ButtonBuilder>();
            buttonCount = 0;
          }

          const button = new ButtonBuilder()
            .setCustomId(`buy_${item.id}`)
            .setLabel(`${item.nom} - ${formatPrice(item.prix)}$`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🛒');

          currentRow.addComponents(button);
          buttonCount++;
        }

        if (buttonCount > 0 && rows.length < 5) {
          rows.push(currentRow);
        }

        await i.update({
          embeds: [newEmbed],
          components: rows.slice(0, 5), // strict limit of 5 rows
        });
      });

      collector.on('end', async () => {
         try {
           await interaction.editReply({ components: [] });
         } catch(e) {}
      });

    } catch (error) {
      console.error('Erreur /boutique:', error);
      await interaction.editReply({ content: '❌ Erreur de boutique.' });
    }
  },
};

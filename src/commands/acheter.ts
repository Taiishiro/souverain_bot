import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { buyItemWithEffectsTransaction } from '../features/economy/transactionHandlers';
import { getOrCreateUser } from '../features/economy/handlers';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('acheter')
    .setDescription('🛍️ Achète un item de la boutique')
    .addStringOption((option) =>
      option
        .setName('item')
        .setDescription('Nom de l\'item à acheter')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;
      let itemNameRaw = interaction.options.getString('item', true);
      
      // if it has a price tag like "Nom [500💰]", we need to extract the actual name
      const itemName = itemNameRaw.replace(/ \[\d+💰\]$/, '');

      // Créer l'user
      await getOrCreateUser(userId);

      // Trouver l'item
      const item = await prisma.shopItem.findUnique({
        where: { nom: itemName },
      });

      if (!item) {
        return await interaction.editReply({
          embeds: [errorEmbed('Item non trouvé', `L'item **${itemName}** n'existe pas.`)],
        });
      }

      const kingdomNameBase = `${interaction.user.username}'s`; 
      const result = await buyItemWithEffectsTransaction(userId, item.id, kingdomNameBase);

      const html = getActionResultHtml({
        title: 'Acquisition Réussie',
        description: `Vous avez obtenu <strong>${item.nom}</strong> pour <strong>${item.prix}💰</strong> !`,
        icon: '🛍️',
        colorHex: '#B8860B'
      });

      const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'achat.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error: any) {
      console.error('Erreur /acheter:', error);
      await interaction.editReply({
        embeds: [errorEmbed("Erreur d'Achat", error.message || "Impossible de traiter l'achat.")],
      });
    }
  },
};

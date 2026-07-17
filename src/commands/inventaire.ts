import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { getInventaireHtml } from '../utils/inventaireTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { inventaireEmbed, errorEmbed } from '../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventaire')
    .setDescription('🎒 Affiche un inventaire')
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription('L\'utilisateur dont vous voulez voir l\'inventaire')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
      const userId = targetUser.id;

      // Créer l'user
      await getOrCreateUser(userId);

      // Récupérer les données
      const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: {
          royaumes_owns: true,
          famille: true,
          _count: {
            select: { dragons: true }
          }
        }
      });

      if (!user) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      // Convertir les inventaire en tableau
      const itemsObj = (user.famille_id && user.famille ? user.famille.inventaire_commun : user.inventaire);
      const items = (itemsObj && typeof itemsObj === 'object') ? itemsObj as Record<string, number> : {};

      
    const htmlArgs = {
        username: targetUser.username,
        avatarUrl: targetUser.displayAvatarURL({ extension: 'png', size: 128 }),
        argent: Number(user.argent_perso).toLocaleString('en-US'),
        royaumeNiveau: user.royaumes_owns && user.royaumes_owns.length > 0 ? 1 : 0,
        creaturesCount: user._count?.dragons || 0,
        artefacts: Object.entries(items).map(([nom, count]) => ({ nom, count }))
    };

    const html = getInventaireHtml(htmlArgs);
    const imageBuffer = await renderHtmlToBuffer(html, 1200, 500);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'inventaire.png' });
    const components: ActionRowBuilder<ButtonBuilder>[] = [];
      if (interaction.user.id === targetUser.id) {
        const usableItems = Object.keys(items).filter(itemName => items[itemName] > 0);
        
        let row = new ActionRowBuilder<ButtonBuilder>();
        for (let i = 0; i < usableItems.length; i++) {
          const itemName = usableItems[i];
          if (row.components.length >= 5) {
            components.push(row);
            row = new ActionRowBuilder<ButtonBuilder>();
          }
          if (components.length >= 5) {
             break; // Maximum 25 boutons (5x5) pour Discord
          }
          
          row.addComponents(
             new ButtonBuilder()
              .setCustomId(`use_${interaction.user.id}_${itemName}`)
              .setLabel(`Utiliser ${itemName.substring(0, 50)}`)
              .setStyle(ButtonStyle.Secondary)
          );
        }
        if (row.components.length > 0 && components.length < 5) {
          components.push(row);
        }
      }

      await interaction.editReply({ files: [attachment], components: components as any });
    } catch (error) {
      console.error('Erreur /inventaire:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de récupérer votre inventaire.')],
      });
    }
  },
};

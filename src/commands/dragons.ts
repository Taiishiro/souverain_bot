import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { getUserDragons } from '../features/dragons/handlers';
import { getOrCreateUser } from '../features/economy/handlers';
import { isFeatureEnabled } from '../utils/gameConfig';
import { errorEmbed } from '../utils/embeds';
import { getDragonsHtml } from '../utils/dragonsTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

const DARK_RED = '#8B0000';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dragons') // Pluralized to match user request better
    .setDescription('🐉 Affiche l\'état complet de vos dragons'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const dragonsEnabled = await isFeatureEnabled('dragons');
      if (!dragonsEnabled) {
        return await interaction.editReply({
          embeds: [errorEmbed('Désactivé', '🐉 Le système de dragons est désactivé.')],
        });
      }

      const userId = interaction.user.id;
      const { prisma } = await import('../db/prisma');
      const user = await prisma.user.findUnique({
        where: { discordId: userId },
      });

      if (!user) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      const dragons = await getUserDragons(user.id);
      
      const username = interaction.user.displayName || interaction.user.username;
      const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 }) || 'https://i.imgur.com/placeholder.png';
      
      const dragonsData = dragons.map(d => ({
        nom: d.nom || `Dragon T${d.tiers.replace('T', '')}`,
        tiers: d.tiers,
        niveau: d.niveau,
        puissance: d.puissance,
        etat: d.etat,
        faim: d.faim,
        energie: d.energie_combat,
        age: d.age_en_jours
      }));

      const html = getDragonsHtml({
        username,
        avatarUrl,
        dragons: dragonsData,
      });
      
      const columns = 2;
      const rows = Math.ceil(dragons.length / columns);
      // Base header height = ~200px
      // Each row = ~320px
      // Minimum height = ~450px 
      const calculatedHeight = Math.max(450, 250 + (rows * 320));
      
      const imageBuffer = await renderHtmlToBuffer(html, 1200, calculatedHeight);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'dragons_antre.png' });
      
      await interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error('Erreur /dragons:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de récupérer vos dragons.')],
      });
    }
  },
};

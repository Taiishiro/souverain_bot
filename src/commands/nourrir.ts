import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { feedDragon, getUserDragons } from '../features/dragons/handlers';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nourrir')
    .setDescription('🍖 Nourrit votre créature magique')
    .addIntegerOption((option) =>
      option
        .setName('index')
        .setDescription('Numéro du dragon (voir /dragon liste)')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;
      const dragonIndex = interaction.options.getInteger('index', true) - 1;

      await getOrCreateUser(userId);

      const user = await prisma.user.findUnique({
        where: { discordId: userId },
      });

      if (!user) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      const dragons = await getUserDragons(user.id);

      if (dragonIndex < 0 || dragonIndex >= dragons.length) {
        return await interaction.editReply({
          embeds: [errorEmbed('Dragon non trouvé', `Vous n'avez pas de dragon numéro ${dragonIndex + 1}`)],
        });
      }

      const dragon = dragons[dragonIndex];

      // Vérifier que le dragon est Vivant
      if (dragon.etat !== 'Vivant') {
        const html = getActionResultHtml({
          title: 'CRÉATURE INERTE',
          description: `Cette créature est à l'état de <strong>${dragon.etat}</strong>.<br>Impossible de la nourrir.<br>Seul l'<strong>Incubateur Sacré</strong> peut la réanimer.`,
          icon: '💀',
          colorHex: '#000000'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'nourrir_erreur.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      const foodCost = BigInt(100); // 100 Oboles pour nourrir

      // Vérifier solde
      if (user.argent_perso < foodCost) {
        const html = getActionResultHtml({
          title: 'Fonds Insuffisants',
          description: `Il vous manque des ressources.<br><br>Coût: <strong>${foodCost}💰</strong><br>Vous possédez: <strong>${user.argent_perso}💰</strong>`,
          icon: '💰',
          colorHex: '#8B0000'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'nourrir_fonds.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      // Nourrir le dragon
      const fed = await feedDragon(dragon.id, 30);

      if (!fed) {
        const html = getActionResultHtml({
          title: 'Erreur',
          description: 'Impossible de nourrir le dragon.',
          icon: '⚠️',
          colorHex: '#8B0000'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'nourrir_erreur.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      // Retirer l'argent
      await prisma.user.update({
        where: { discordId: userId },
        data: {
          argent_perso: user.argent_perso - foodCost,
        },
      });

      const nomAffiche = dragon.nom ? dragon.nom : `Dragon ${dragon.tiers}`;
      const html = getActionResultHtml({
        title: 'CRÉATURE NOURRIE',
        description: `Bête : <strong>${nomAffiche}</strong><br>Faim restaurée à : <strong>${fed.faim}/100</strong><br><br>Coût : <strong>${foodCost}💰</strong>`,
        icon: '🍖',
        colorHex: '#006400'
      });
      const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'nourrir_succes.png' });
      
      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /nourrir:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de nourrir le dragon.')],
      });
    }
  },
};

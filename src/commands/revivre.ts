import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { reviveDragon, getUserDragons } from '../features/dragons/handlers';
import { errorEmbed, revivalEmbed } from '../utils/embeds';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

const RESURRECTION_ARTIFACT = 'Incubateur Sacré';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('revivre')
    .setDescription('🔮 Ressuscite un squelette de dragon avec Incubateur Sacré')
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

      // Vérifier que le dragon est un squelette
      if (dragon.etat !== 'Squelette') {
        const html = getActionResultHtml({
          title: 'CRÉATURE VIVANTE',
          description: `Ce dragon est déjà à l'état <strong>${dragon.etat}</strong>.<br><br>Seuls les <strong>Squelettes</strong> peuvent être ressuscités.`,
          icon: '🐉',
          colorHex: '#424242'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'revivre_info.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      // Vérifier l'Incubateur Sacré
      const inventaire = user.inventaire as Record<string, number>;
      const incubators = inventaire[RESURRECTION_ARTIFACT] || 0;

      if (incubators < 1) {
        const html = getActionResultHtml({
          title: 'Artéfact Manquant',
          description: `Il vous manque l'Artéfact de Résurrection : <strong>${RESURRECTION_ARTIFACT}</strong>.<br><br>Vous en possédez : <strong>${incubators}</strong>`,
          icon: '🔮',
          colorHex: '#8B0000'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'revivre_manque.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      // Ressusciter le dragon
      const revived = await reviveDragon(dragon.id, userId);

      const nomAffiche = revived.nom ? revived.nom : `Dragon T${revived.tiers.substring(1)}`;
      const html = getActionResultHtml({
        title: 'RÉSURRECTION SACRÉE',
        description: `La bête <strong>${nomAffiche}</strong> est revenue à la vie !<br><br>Faim : <strong>${revived.faim}/100</strong><br>Énergie : <strong>${revived.energie_combat}/100</strong><br><br><strong>1x ${RESURRECTION_ARTIFACT}</strong> consumé.`,
        icon: '🔮',
        colorHex: '#B8860B'
      });
      const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'revivre_succes.png' });
      await interaction.editReply({ files: [attachment] });
    } catch (error: any) {
      console.error('Erreur /revivre:', error);
      
      // Afficher le message d'erreur spécifique du handler
      const errorMsg = error.message || 'Impossible de ressusciter le dragon.';
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', errorMsg)],
      });
    }
  },
};

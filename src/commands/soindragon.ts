import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { healDragon, getUserDragons } from '../features/dragons/handlers';
import { errorEmbed } from '../utils/embeds';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

const HEAL_ARTIFACT = 'Élixir de Restauration';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('soindragon')
    .setDescription('⚕️ Soigne complètement votre créature')
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
          description: `Cette créature est à l'état de <strong>${dragon.etat}</strong>.<br>Impossible de la soigner.<br>Seul l'<strong>Incubateur Sacré</strong> peut la réanimer.`,
          icon: '💀',
          colorHex: '#000000'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'soin_erreur.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      // Vérifier que l'utilisateur a l'artefact
      const inventaire = user.inventaire as Record<string, number>;
      const healArtifacts = inventaire[HEAL_ARTIFACT] || 0;

      if (healArtifacts < 1) {
        const html = getActionResultHtml({
          title: 'Artéfact Manquant',
          description: `Il vous manque l'Artéfact de Restauration : <strong>${HEAL_ARTIFACT}</strong>.<br><br>Vous en possédez : <strong>${healArtifacts}</strong>`,
          icon: '🔮',
          colorHex: '#8B0000'
        });
        const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'soin_manque.png' });
        return await interaction.editReply({ files: [attachment] });
      }

      // Soigner le dragon
      const healed = await healDragon(dragon.id);

      if (!healed) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Impossible de soigner le dragon.')],
        });
      }

      // Consommer l'artefact
      inventaire[HEAL_ARTIFACT] -= 1;
      await prisma.user.update({
        where: { discordId: userId },
        data: {
          inventaire: inventaire as any,
        },
      });

      const nomAffiche = healed.nom ? healed.nom : `Dragon T${healed.tiers.substring(1)}`;
      const html = getActionResultHtml({
        title: 'RESTAURATION COMPLÈTE',
        description: `Bête : <strong>${nomAffiche}</strong><br><br>Faim restaurée : <strong>100/100</strong><br>Énergie restaurée : <strong>100/100</strong><br><br><strong>1x ${HEAL_ARTIFACT}</strong> consumé.`,
        icon: '⚕️',
        colorHex: '#006400'
      });
      const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'soin_succes.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /soindragon:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de soigner le dragon.')],
      });
    }
  },
};

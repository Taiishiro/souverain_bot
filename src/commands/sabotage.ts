import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { performSabotage } from '../features/combat/handlers';
import { hasCooldown, setCooldown, getCooldownTimeRemaining, formatTimeRemaining } from '../utils/cooldown';
import { errorEmbed } from '../utils/embeds';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

const GOLD = '#FFD700';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sabotage')
    .setDescription('🗡️ Sabote un dragon d\'un utilisateur (cooldown 24h)')
    .addUserOption((option) =>
      option
        .setName('cible')
        .setDescription('L\'utilisateur dont on sabote le dragon')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const attacker_id = interaction.user.id;
      const defender_discord = interaction.options.getUser('cible', true);
      const defender_id = defender_discord.id;

      // Vérifier cooldown
      if (await hasCooldown(attacker_id, 'sabotage')) {
        const remaining = await getCooldownTimeRemaining(attacker_id, 'sabotage');
        const timeStr = formatTimeRemaining(remaining || 0);

        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Cooldown actif',
              `⏰ Vous devez attendre **${timeStr}** avant de sabotter à nouveau.`
            ),
          ],
        });
      }

      const attacker = await getOrCreateUser(attacker_id);
      const defender = await getOrCreateUser(defender_id);

      // Effectuer le sabotage
      const result = await performSabotage(attacker.id, defender.id);

      // Définir le cooldown (24h)
      await setCooldown(attacker_id, 'sabotage', 24);

      if (!result.success) {
        return await interaction.editReply({
          embeds: [
            errorEmbed('Sabotage échoué', `💔 Le sabotage de **${defender_discord.username}** a échoué!`)
          ],
        });
      }

      const html = getActionResultHtml({
        title: 'Sabotage réussi!',
        description: `Vous avez saboté le dragon <strong>${result.dragon_sabotaged}</strong> de <strong>${defender_discord.username}</strong><br><br>Sa puissance a été réduite ou son état altéré.`,
        icon: '🗡️',
        colorHex: '#8B0000'
      });

      const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'sabotage.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /sabotage:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible d\'effectuer le sabotage.')],
      });
    }
  },
};

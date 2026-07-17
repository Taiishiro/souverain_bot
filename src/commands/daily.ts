import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser, addMoney } from '../features/economy/handlers';
import { getUserData } from '../utils/getUserData';
import { hasCooldown, setCooldown, getCooldownTimeRemaining, formatTimeRemaining } from '../utils/cooldown';
import { successEmbed, errorEmbed, infoEmbed } from '../utils/embeds';
import { getConfig } from '../features/economy/handlers';
import { getDailyCardHtml } from '../utils/dailyCardTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('💰 Réclamer votre tribut quotidien du Trône Quantique'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;

      // Créer l'user s'il n'existe pas
      await getOrCreateUser(userId);

      // Vérifier cooldown
      if (await hasCooldown(userId, 'daily')) {
        const remaining = await getCooldownTimeRemaining(userId, 'daily');
        const timeStr = formatTimeRemaining(remaining || 0);

        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Récompense quotidienne',
              `⏰ Vous devez attendre **${timeStr}** avant de réclamer votre prochaine récompense.`
            ),
          ],
        });
      }

      // Obtenir la config
      const config = await getConfig();
      const dailyAmount = config.daily_amount;

      // Ajouter l'argent
      const success = await addMoney(userId, dailyAmount);

      if (!success) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Impossible d\'ajouter l\'argent.')],
        });
      }

      // Définir le cooldown
      await setCooldown(userId, 'daily', config.daily_cooldown);

      // Récupérer l'utilisateur pour le message
      const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: { famille: true },
      });

      const totalArgent = user?.famille_id ? user.famille?.argent_commun : user?.argent_perso;

      const html = getDailyCardHtml({
        avatarUrl: interaction.user.displayAvatarURL(),
        username: interaction.user.username,
        receivedAmount: dailyAmount.toLocaleString(),
        newTotal: totalArgent?.toLocaleString() || "0"
      });

      // Génération très rapide via le navigateur persistant
      const imageBuffer = await renderHtmlToBuffer(html, 1000, 300);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'daily.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /daily:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de traiter la commande.')],
      });
    }
  },
};

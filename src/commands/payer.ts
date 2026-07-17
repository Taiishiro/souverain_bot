import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  UserResolvable,
  AttachmentBuilder
} from 'discord.js';
import { getUserData, paiement } from '../utils/getUserData';
import { getOrCreateUser } from '../features/economy/handlers';
import { hasCooldown, setCooldown, getCooldownTimeRemaining, formatTimeRemaining } from '../utils/cooldown';
import { errorEmbed, successEmbed } from '../utils/embeds';
import { getConfig } from '../features/economy/handlers';
import { isFeatureEnabled } from '../utils/gameConfig';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('payer')
    .setDescription('💳 Payez un autre utilisateur')
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription('L\'utilisateur à payer')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('montant')
        .setDescription('Montant à payer')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName('raison')
        .setDescription('Raison du paiement (optionnel)')
        .setRequired(false)
        .setMaxLength(100)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Vérifier si les paiements sont activés
      const paymentsEnabled = await isFeatureEnabled('payments');
      if (!paymentsEnabled) {
        return await interaction.editReply({
          embeds: [errorEmbed('Fonctionnalité désactivée', '💸 Le système de paiements est actuellement désactivé par les administrateurs.')],
        });
      }
      const sender = interaction.user;
      const receiver = interaction.options.getUser('utilisateur', true);
      const montant = BigInt(interaction.options.getInteger('montant') || 0);
      const raison = interaction.options.getString('raison');

      if (montant <= 0) {
        return await interaction.editReply({
          embeds: [errorEmbed('Montant invalide', 'Le montant doit être supérieur à 0.')],
        });
      }

      if (sender.id === receiver.id) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Vous ne pouvez pas vous payer à vous-même.')],
        });
      }

      // Créer les users
      await getOrCreateUser(sender.id);
      await getOrCreateUser(receiver.id);

      // Vérifier le solde
      const senderData = await getUserData(sender.id);
      if (!senderData || senderData.argent < montant) {
        return await interaction.editReply({
          embeds: [
            errorEmbed('Solde insuffisant', `Vous n'avez que **${senderData?.argent || 0}$**.`),
          ],
        });
      }

      // Effectuer le paiement
      const config = await getConfig();

      // Vérifier si l'utilisateur peut bypasser les taxes (admin ou propriétaire du serveur)
      const member = await interaction.guild?.members.fetch(sender.id);
      const canBypassTax = member?.permissions.has('Administrator') || member?.permissions.has('ManageGuild') || interaction.guild?.ownerId === sender.id;

      const taxPercentage = canBypassTax ? 0 : config.tax_percentage;
      const taxe = (montant * BigInt(taxPercentage)) / BigInt(100);
      const success = await paiement(sender.id, receiver.id, montant, taxPercentage);

      if (!success) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Le paiement a échoué.')],
        });
      }

      // Afficher le résultat
      const received = montant - taxe;
      let description = `<strong>${sender.username}</strong> a versé <strong>${montant}💰</strong> à <strong>${receiver.username}</strong>.`;
      if (taxe > 0) {
        description += `<br><br>Taxe Seigneuriale (${taxPercentage}%) : <strong>${taxe}💰</strong><br>Montant reçu net : <strong>${received}💰</strong>`;
      } else {
        description += `<br><br>Exempté de taxe seigneuriale.`;
      }
      
      if (raison && raison.trim().length > 0) {
        description += `<br><br><em>"${raison}"</em>`;
      }

      const html = getActionResultHtml({
        title: 'Tribut Accompli',
        description: description,
        icon: '📜',
        colorHex: '#B8860B'
      });

      const imageBuffer = await renderHtmlToBuffer(html, 600, 300);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'paiement.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /payer:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de traiter le paiement.')],
      });
    }
  },
};

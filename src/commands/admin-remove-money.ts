import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../db/prisma';
import { getUserData } from '../utils/getUserData';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { hasAdminPermissions } from '../utils/adminPermissions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-remove-money')
    .setDescription('💸 [ADMIN] Enlever de l\'argent à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui enlever l\'argent')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Montant à enlever')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction: ChatInputCommandInteraction) {
    // Vérifier permissions admin personnalisées
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member) {
      return await interaction.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de vérifier vos permissions.')],
        ephemeral: true,
      });
    }

    const hasAdmin = await hasAdminPermissions(member);
    if (!hasAdmin) {
      return await interaction.reply({
        embeds: [errorEmbed('Accès refusé', 'Vous devez être administrateur pour utiliser cette commande.\n\nUtilisez `/setup-admin` pour configurer les administrateurs du bot.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser('utilisateur', true);
      const amount = interaction.options.getInteger('montant', true);

      // Récupérer les données actuelles
      const userData = await getUserData(targetUser.id);
      if (!userData) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      // Vérifier si l'utilisateur a assez d'argent
      if (userData.argent < BigInt(amount)) {
        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Fonds insuffisants',
              `${targetUser.username} n'a que **${userData.argent}$** disponible.`
            ),
          ],
        });
      }

      // Enlever l'argent
      const newAmount = userData.argent - BigInt(amount);

      if (userData.source === 'famille') {
        // Mettre à jour l'argent commun de la famille
        await prisma.famille.update({
          where: { id: userData.famille_id! },
          data: { argent_commun: newAmount },
        });
      } else {
        // Mettre à jour l'argent personnel
        await prisma.user.update({
          where: { discordId: targetUser.id },
          data: { argent_perso: newAmount },
        });
      }

      await interaction.editReply({
        embeds: [
          successEmbed(
            '💸 Argent retiré',
            `**${amount}$** ont été retirés du compte de ${targetUser.username}.\nSolde actuel: **${newAmount}$**`
          ),
        ],
      });

    } catch (error) {
      console.error('Erreur commande admin-remove-money:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Une erreur est survenue.')],
      });
    }
  },
};
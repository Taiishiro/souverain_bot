import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { addMoney } from '../features/economy/handlers';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { hasAdminPermissions } from '../utils/adminPermissions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-give-money')
    .setDescription('💰 [ADMIN] Donner de l\'argent à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui donner l\'argent')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Montant à donner')
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

      // Ajouter l'argent
      const success = await addMoney(targetUser.id, BigInt(amount));

      if (!success) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Impossible d\'ajouter l\'argent.')],
        });
      }

      await interaction.editReply({
        embeds: [
          successEmbed(
            '💰 Argent donné',
            `**${amount}$** ont été ajoutés au compte de ${targetUser.username}.`
          ),
        ],
      });

    } catch (error) {
      console.error('Erreur commande admin-give-money:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Une erreur est survenue.')],
      });
    }
  },
};
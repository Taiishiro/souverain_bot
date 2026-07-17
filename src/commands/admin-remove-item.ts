import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../db/prisma';
import { removeItemFromInventory } from '../features/economy/handlers';
import { getUserData } from '../utils/getUserData';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { hasAdminPermissions } from '../utils/adminPermissions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-remove-item')
    .setDescription('🗑️ [ADMIN] Retirer un item de l\'inventaire d\'un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui retirer l\'item')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Nom de l\'item à retirer')
        .setRequired(true)
        .setAutocomplete(true))
    .addIntegerOption(option =>
      option.setName('quantite')
        .setDescription('Quantité à retirer (défaut: 1)')
        .setRequired(false)
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
      const itemName = interaction.options.getString('item', true);
      const quantity = interaction.options.getInteger('quantite') || 1;

      // Vérifier que l'utilisateur existe
      const userData = await getUserData(targetUser.id);
      if (!userData) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      // Vérifier que l'item existe dans l'inventaire
      const currentQuantity = userData.inventaire[itemName] || 0;
      if (currentQuantity < quantity) {
        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Quantité insuffisante',
              `${targetUser.username} n'a que **${currentQuantity}x ${itemName}** dans son inventaire.`
            ),
          ],
        });
      }

      // Retirer l'item de l'inventaire
      const success = await removeItemFromInventory(targetUser.id, itemName, quantity);

      if (!success) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Impossible de retirer l\'item de l\'inventaire.')],
        });
      }

      await interaction.editReply({
        embeds: [
          successEmbed(
            '🗑️ Item retiré',
            `**${quantity}x ${itemName}** ${quantity > 1 ? 'ont été retirés' : 'a été retiré'} de l'inventaire de ${targetUser.username}.`
          ),
        ],
      });

    } catch (error) {
      console.error('Erreur commande admin-remove-item:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Une erreur est survenue.')],
      });
    }
  },
};
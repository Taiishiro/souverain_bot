import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../db/prisma';
import { addItemToInventory } from '../features/economy/handlers';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { hasAdminPermissions } from '../utils/adminPermissions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-give-item')
    .setDescription('🎁 [ADMIN] Donner un item à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur à qui donner l\'item')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Nom de l\'item à donner')
        .setRequired(true)
        .setAutocomplete(true))
    .addIntegerOption(option =>
      option.setName('quantite')
        .setDescription('Quantité à donner (défaut: 1)')
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

      // Vérifier que l'item existe
      const item = await prisma.shopItem.findUnique({
        where: { nom: itemName },
      });

      if (!item) {
        return await interaction.editReply({
          embeds: [errorEmbed('Item non trouvé', `L'item **${itemName}** n'existe pas.`)],
        });
      }

      // Ajouter l'item à l'inventaire
      const success = await addItemToInventory(targetUser.id, itemName, quantity);

      if (!success) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Impossible d\'ajouter l\'item à l\'inventaire.')],
        });
      }

      await interaction.editReply({
        embeds: [
          successEmbed(
            '🎁 Item donné',
            `**${quantity}x ${itemName}** ${quantity > 1 ? 'ont été ajoutés' : 'a été ajouté'} à l'inventaire de ${targetUser.username}.`
          ),
        ],
      });

    } catch (error) {
      console.error('Erreur commande admin-give-item:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Une erreur est survenue.')],
      });
    }
  },
};
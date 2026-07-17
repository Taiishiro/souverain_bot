import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../db/prisma';
import { errorEmbed, successEmbed } from '../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-admin')
    .setDescription('👑 Configure qui contrôle le bot (Propriétaire serveur seulement)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('Rôle qui aura les droits d\'administration du bot')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Vérifier que c'est le propriétaire du serveur
    if (interaction.guild?.ownerId !== interaction.user.id) {
      return await interaction.reply({
        embeds: [errorEmbed('Accès refusé', 'Seul le propriétaire du serveur peut configurer les administrateurs du bot.')],
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole('role', true);

    try {
      // Sauvegarder la configuration en base de données
      await prisma.gameConfig.upsert({
        where: { key: 'admin_role_id' },
        update: {
          value: role.id,
          description: `Rôle administrateur configuré par ${interaction.user.username}`,
          category: 'permissions'
        },
        create: {
          key: 'admin_role_id',
          value: role.id,
          description: `Rôle administrateur configuré par ${interaction.user.username}`,
          category: 'permissions'
        }
      });

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('👑 Configuration administrateur')
        .setDescription(
          `**Rôle administrateur défini :** ${role}\n\n` +
          `Les membres avec ce rôle peuvent maintenant utiliser les commandes d'administration :\n` +
          `• \`/config\` - Gestion des configurations\n` +
          `• \`/admin-give-money\` - Distribution d'argent\n` +
          `• \`/admin-give-item\` - Distribution d'items\n` +
          `• \`/setup\` - Distribution initiale d'argent`
        )
        .setFooter({ text: 'Configuration sauvegardée en base de données' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur setup-admin:', error);
      await interaction.reply({
        embeds: [errorEmbed('Erreur', 'Impossible de sauvegarder la configuration.')],
        ephemeral: true,
      });
    }
  },
};
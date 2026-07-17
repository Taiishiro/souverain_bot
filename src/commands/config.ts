import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { setFeatureEnabled, getAllConfigs, isFeatureEnabled } from '../utils/gameConfig';
import { errorEmbed, successEmbed } from '../utils/embeds';
import { hasAdminPermissions } from '../utils/adminPermissions';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('🔧 Gère la configuration du jeu (Admin seulement)')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Active/désactive une mécanique du jeu')
        .addStringOption((option) =>
          option
            .setName('feature')
            .setDescription('Mécanique à modifier')
            .setRequired(true)
            .addChoices(
              { name: '🛒 Boutique', value: 'boutique' },
              { name: '🐉 Dragons', value: 'dragons' },
              { name: '👑 Royaumes', value: 'royaumes' },
              { name: '👨‍👩‍👧‍👦 Familles', value: 'familles' },
              { name: '⚔️ Combat', value: 'combat' },
              { name: '🤝 Diplomatie', value: 'diplomatie' },
              { name: '💰 Économie', value: 'economy' },
              { name: '🎁 Daily rewards', value: 'daily' },
              { name: '💸 Paiements', value: 'payments' },
              { name: '🎭 Mariage', value: 'marriage' },
            )
        )
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Activer ou désactiver')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Affiche toutes les configurations')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Vérifier les permissions admin
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
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'toggle') {
        const feature = interaction.options.getString('feature', true);
        const enabled = interaction.options.getBoolean('enabled', true);

        const featureNames: Record<string, string> = {
          boutique: '🛒 Boutique',
          dragons: '🐉 Dragons',
          royaumes: '👑 Royaumes',
          familles: '👨‍👩‍👧‍👦 Familles',
          combat: '⚔️ Combat',
          diplomatie: '🤝 Diplomatie',
          economy: '💰 Économie',
          daily: '🎁 Daily rewards',
          payments: '💸 Paiements',
          marriage: '🎭 Mariage',
        };

        await setFeatureEnabled(feature, enabled, `Contrôle de la mécanique ${featureNames[feature]}`);

        const embed = new EmbedBuilder()
          .setColor(enabled ? '#00FF00' : '#FF0000')
          .setTitle('🔧 Configuration modifiée')
          .setDescription(
            `**${featureNames[feature]}** ${enabled ? '✅ **ACTIVÉ**' : '❌ **DÉSACTIVÉ**'}\n\n` +
            `Cette mécanique est maintenant ${enabled ? 'disponible' : 'indisponible'} pour tous les joueurs.`
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (subcommand === 'list') {
        const configs = await getAllConfigs();

        if (configs.length === 0) {
          return await interaction.editReply({
            embeds: [errorEmbed('Aucune configuration', 'Aucune configuration trouvée.')],
          });
        }

        const features = configs.filter(c => c.category === 'features');
        const other = configs.filter(c => c.category !== 'features');

        let description = '';

        if (features.length > 0) {
          description += '**🔧 Mécaniques du jeu :**\n';
          for (const config of features) {
            const featureName = config.key.replace('feature_', '');
            const featureNames: Record<string, string> = {
              boutique: '🛒 Boutique',
              dragons: '🐉 Dragons',
              royaumes: '👑 Royaumes',
              familles: '👨‍👩‍👧‍👦 Familles',
              combat: '⚔️ Combat',
              diplomatie: '🤝 Diplomatie',
              economy: '💰 Économie',
              daily: '🎁 Daily rewards',
              payments: '💸 Paiements',
              marriage: '🎭 Mariage',
            };

            const status = config.value.toLowerCase() === 'true' ? '✅' : '❌';
            description += `${status} ${featureNames[featureName] || featureName}\n`;
          }
          description += '\n';
        }

        if (other.length > 0) {
          description += '**⚙️ Autres configurations :**\n';
          for (const config of other) {
            description += `• **${config.key}**: ${config.value}\n`;
          }
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('🔧 Configurations du jeu')
          .setDescription(description)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur /config:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de modifier la configuration.')],
      });
    }
  },
};
import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getOrCreateUser } from '../features/economy/handlers';
import { getUserDragons } from '../features/dragons/handlers';
import { errorEmbed } from '../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nommerdragon')
    .setDescription('📝 Donner un nom à l\'un de vos dragons')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Le nouveau nom du dragon')
        .setRequired(true)
        .setMaxLength(50)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;
      const user = await getOrCreateUser(userId);
      const nouveauNom = interaction.options.getString('nom', true);

      const dragons = await getUserDragons(user.id);

      if (dragons.length === 0) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', "Vous n'avez aucun dragon à nommer.")],
        });
      }

      // Créer un menu déroulant pour choisir le dragon
      const options = dragons.slice(0, 25).map((d) => ({
        label: d.nom ? `${d.nom} (Tiers ${d.tiers})` : `Dragon ${d.tiers} (Sans nom)`,
        description: `Niveau ${d.niveau} | Puissance: ${d.puissance} | ${d.etat}`,
        value: d.id,
      }));

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`nameDragon_${interaction.user.id}_${nouveauNom}`)
          .setPlaceholder('Choisissez le dragon à nommer')
          .addOptions(options)
      );

      await interaction.editReply({
        content: `📝 **${interaction.user.username}**, choisissez le dragon que vous souhaitez renommer en "**${nouveauNom}**" :`,
        components: [row as any],
      });
    } catch (error) {
      console.error('Erreur /nommerdragon:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', "Impossible d'exécuter la commande.")],
      });
    }
  },
};
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { getFamilleByUser } from '../features/diplomatie/handlers';
import { errorEmbed } from '../utils/embeds';
import { getFamilleHtml } from '../utils/mariageTemplates';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

const GOLD = '#FFD700';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('famille')
    .setDescription('👥 Gère votre famille')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('info')
        .setDescription('Affiche les infos de votre famille')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('nom')
        .setDescription('Change le nom de votre famille')
        .addStringOption((option) =>
          option
            .setName('nouveau_nom')
            .setDescription('Nouveau nom')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;
      await getOrCreateUser(userId);

      const user = await prisma.user.findUnique({
        where: { discordId: userId },
      });

      if (!user) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'info') {
        const famille = await getFamilleByUser(user.id);

        if (!famille) {
          return await interaction.editReply({
            embeds: [errorEmbed('Pas de famille', 'Vous n\'avez pas de famille. Utilisez /marier.')],
          });
        }

        // Fetch discord users to get their display names
        const memberNames = [];
        for (const m of famille.membres) {
          const fetchedUser = await interaction.client.users.fetch(m.discordId);
          memberNames.push(fetchedUser.username);
        }

        const htmlArgs = {
          nom: famille.nom,
          membres: memberNames,
          argent: famille.argent_commun.toLocaleString(),
          date: famille.date_creation.toLocaleDateString('fr-FR')
        };

        const html = getFamilleHtml(htmlArgs);
        const imageBuffer = await renderHtmlToBuffer(html, 600, 400);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'famille.png' });

        await interaction.editReply({ files: [attachment] });

      } else if (subcommand === 'nom') {
        const famille = await getFamilleByUser(user.id);

        if (!famille) {
          return await interaction.editReply({
            embeds: [errorEmbed('Pas de famille', 'Vous n\'avez pas de famille.')],
          });
        }

        if (famille.chef_id !== user.id) {
          return await interaction.editReply({
            embeds: [errorEmbed('Permission refusée', 'Seul le chef peut renommer la famille.')],
          });
        }

        const newNom = interaction.options.getString('nouveau_nom', true);

        await prisma.famille.update({
          where: { id: famille.id },
          data: { nom: newNom },
        });

        // Maybe just an embed for renaming to be fast, but user asked for image for all commands? "je veux des images pour chaque commandes de la fonctionnalite mariage". I'll generate the family info image showing the new name.
        const memberNames = [];
        for (const m of famille.membres) {
          const fetchedUser = await interaction.client.users.fetch(m.discordId);
          memberNames.push(fetchedUser.username);
        }

        const htmlArgs = {
          nom: newNom + " (Renommée)",
          membres: memberNames,
          argent: famille.argent_commun.toLocaleString(),
          date: famille.date_creation.toLocaleDateString('fr-FR')
        };

        const html = getFamilleHtml(htmlArgs);
        const imageBuffer = await renderHtmlToBuffer(html, 600, 400);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'famille_renommee.png' });

        await interaction.editReply({ content: 'Le nom a bien été changé.', files: [attachment] });
      }
    } catch (error) {
      console.error('Erreur /famille:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de traiter la commande.')],
      });
    }
  },
};

import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getTopArgentHtml } from '../utils/topargentTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topargent')
    .setDescription('🏆 Affiche le top 10 des plus riches'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Top utilisateurs solo
      const topUsers = await prisma.user.findMany({
        orderBy: { argent_perso: 'desc' },
        take: 10,
      });

      // Top familles
      const topFamilles = await prisma.famille.findMany({
        orderBy: { argent_commun: 'desc' },
        take: 10,
      });

      // Récupérer les noms Discord pour les joueurs et formater
      const players = await Promise.all(topUsers.map(async (u: any) => {
        let name = 'Utilisateur inconnu';
        try {
            const discordUser = await interaction.client.users.fetch(u.discordId);
            name = discordUser.username;
        } catch (e) {
            // Ignorer si l'utilisateur est introuvable
            name = `User ${u.discordId.substring(0, 4)}...`;
        }
        return { name, gold: Number(u.argent_perso) };
      }));

      const families = topFamilles.map((f: any) => ({
        name: f.nom,
        gold: Number(f.argent_commun)
      }));

      const html = getTopArgentHtml(players, families);
      
      const imageBuffer = await renderHtmlToBuffer(html, 1200, 600);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'topargent.png' });

      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /topargent:', error);
      await interaction.editReply({
        content: '❌ Erreur lors de la génération du classement.',
      });
    }
  },
};

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { getPuissanceHtml } from '../utils/puissanceTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { prisma } from '../db/prisma';
import { getOrCreateUser, getUserTotalPower } from '../features/economy/handlers';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('puissance')
    .setDescription('🗡️ Affiche la puissance totale des armées d\'un sujet')
    .addUserOption((option) =>
      option
        .setName('cible')
        .setDescription('L\'utilisateur ciblé')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser('cible') || interaction.user;
      
      let user = await prisma.user.findUnique({ where: { id: targetUser.id } });
      if (!user && targetUser.id === interaction.user.id) {
          user = await getOrCreateUser(targetUser.id);
      }
      if (!user) {
          return await interaction.editReply({ content: '❌ Impossible de récupérer les informations de ce joueur.' });
      }
      
      const dragons = await prisma.dragon.findMany({ 
        where: { owner_id: user.id } 
      });
      
      const dragonsVivants = dragons.filter(d => d.etat === 'Vivant');
      const dragonsSquelettes = dragons.filter(d => d.etat === 'Squelette');
      
      const userWithFamille = await prisma.user.findUnique({
        where: { id: user.id },
        include: { famille: true }
      });
      
      const inv = userWithFamille?.famille_id && userWithFamille.famille 
        ? userWithFamille.famille.inventaire_commun 
        : userWithFamille?.inventaire;
        
      const puines = (inv && (inv as Record<string, number>)['Puîné']) || 0;
      
      const totalPower = await getUserTotalPower(user.id);

      
    const htmlArgs = {
        username: interaction.user.username,
        avatarUrl: interaction.user.displayAvatarURL({ extension: 'png', size: 128 }),
        titre: "[Force de Frappe]",
        dragonsVivants: dragonsVivants.length,
        dragonsSquelettes: dragonsSquelettes.length,
        puines,
        totalPower
    };

    const html = getPuissanceHtml(htmlArgs);
    const imageBuffer = await renderHtmlToBuffer(html, 1200, 450);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'puissance.png' });

    await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /puissance:', error);
      await interaction.editReply({ content: 'Une erreur est survenue lors de l\'inspection des armées.' });
    }
  },
};

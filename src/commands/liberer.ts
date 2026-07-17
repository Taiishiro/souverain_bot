import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getActionResultHtml } from '../utils/actionResultTemplate';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('liberer')
    .setDescription('🗝️ Libérer un sujet de vos cachots (Souverain)')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Le prisonnier à gracier')
        .setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser('utilisateur', true);
      const executorId = interaction.user.id;
      const targetId = targetUser.id;

      // 1. Vérifier si l'exécuteur possède un royaume
      const royaume = await prisma.royaume.findFirst({
        where: { owner_id: executorId }
      });

      if (!royaume) {
        return await interaction.editReply({
          embeds: [errorEmbed('Accès Refusé', "👑 Vous devez posséder un Royaume pour gracier quelqu'un.")],
        });
      }

      // 2. Vérifier si la cible est bien en prison dans CE royaume
      const prisonRecord = await prisma.emprisonnement.findFirst({
        where: { 
          prisonnier_id: targetId,
          royaume_id: royaume.id
        }
      });

      if (!prisonRecord) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', "Cet utilisateur n'est pas emprisonné dans vos cachots.")],
        });
      }

      // 3. Retirer le rôle Prisonnier et les permissions
      const targetMember = await interaction.guild?.members.fetch(targetId).catch(() => null);
      if (targetMember) {
        const prisonnierRole = interaction.guild?.roles.cache.find(r => r.name === 'Prisonnier');
        if (prisonnierRole) {
          await targetMember.roles.remove(prisonnierRole);
        }

        const cachotChannel = interaction.guild?.channels.cache.get(prisonRecord.vocal_id);
        if (cachotChannel) {
          await (cachotChannel as any).permissionOverwrites.delete(targetMember.id).catch(() => null);
          
          if (targetMember.voice.channelId === cachotChannel.id) {
            // Le déconnecter du vocal de la prison (le kick vocalement)
            try {
              await targetMember.voice.disconnect();
            } catch (e) {}
          }
        }
      }

      // 4. Supprimer l'enregistrement DB
      await prisma.emprisonnement.delete({
        where: { id: prisonRecord.id }
      });

      const html = getActionResultHtml({
        title: 'Grâce Royale',
        description: `<strong>${targetUser.username}</strong> a été libéré(e) de vos cachots.`,
        icon: '🕊️',
        colorHex: '#006400'
      });

      const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'liberer.png' });

      await interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error('Erreur /liberer:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de libérer le prisonnier.')],
      });
    }
  },
};
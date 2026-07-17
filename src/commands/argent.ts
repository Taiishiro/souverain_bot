import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { getUserData } from '../utils/getUserData';
import { getOrCreateUser, getUserWealthRank } from '../features/economy/handlers';
import { errorEmbed } from '../utils/embeds';
import { getArgentCardHtml } from '../utils/argentCardTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('argent')
    .setDescription('💰 Consulter la trésorerie royale d\'un sujet')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Sujet dont vous souhaitez inspecter la trésorerie (optionnel)')
        .setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
      const targetUserId = targetUser.id;

      if (targetUserId === interaction.user.id) {
        await getOrCreateUser(targetUserId);
      }

      const userData = await getUserData(targetUserId);

      if (!userData) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      const gold = userData.argent.toLocaleString();
      const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 }) || targetUser.defaultAvatarURL;
      const username = targetUser.username;
      const rank = (await getUserWealthRank(targetUserId, userData.source === 'famille'))?.toString() || '-';
      
      // Si argent est supérieur au record (ex: via admin commande), le vrai record est au moins l'argent actuel
      const realRecord = userData.argentRecord > userData.argent ? userData.argentRecord : userData.argent;
      const record = realRecord > BigInt(0) ? realRecord.toLocaleString() : gold;

      // Barre de progression
      const currentArgentNum = Number(userData.argent);
      const recordArgentNum = Number(realRecord);
      
      let barPercent = 100;
      if (recordArgentNum > 0) {
        barPercent = Math.min(100, Math.round((currentArgentNum / recordArgentNum) * 100));
      }

      const html = getArgentCardHtml({ avatarUrl, username, gold, rank, record, barPercent });
      
      const imageBuffer = await renderHtmlToBuffer(html, 1000, 300);
      
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'argent.png' });
      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erreur /argent:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de récupérer le solde.')],
      });
    }
  },
};

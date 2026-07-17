import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { errorEmbed } from '../utils/embeds';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';
import { getDivorceHtml } from '../utils/mariageTemplates';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('💔 Négocier et dissoudre votre union (50% du patrimoine sera détruit)'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;
      const user = await prisma.user.findUnique({ where: { discordId: userId } });

      if (!user?.famille_id) {
        return await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Vous n\'êtes pas marié.')] });
      }

      const famille = await prisma.famille.findUnique({
        where: { id: user.famille_id },
        include: { membres: true }
      });

      if (!famille || famille.membres.length < 2) {
        return await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Famille introuvable ou vous êtes seul.')] });
      }

      const partner = famille.membres.find(m => m.discordId !== userId);
      if (!partner) return await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Partenaire introuvable.')] });

      // Calculate base amounts
      const totalArgent = famille.argent_commun;
      const destroyed = totalArgent / BigInt(2);
      const remaining = totalArgent - destroyed;

      let percentageUser = 50; // Pourcentage du reste allant à l'initiateur
      let userAccepted = false;
      let partnerAccepted = false;

      const userObj = await interaction.client.users.fetch(userId);
      const partnerObj = await interaction.client.users.fetch(partner.discordId);

      const generateEmbed = () => {
         const userShare = (remaining * BigInt(percentageUser)) / BigInt(100);
         const partnerShare = remaining - userShare;
         const pUser = percentageUser;
         const pPartner = 100 - percentageUser;
        
         const embed = new EmbedBuilder()
          .setColor(COLORS.DANGER)
          .setTitle('💔 NÉGOCIATION DE DIVORCE')
          .setDescription(`<@${userId}> et <@${partner.discordId}>

⚠️ **50% de votre argent commun et de vos items seront INCINÉRÉS.** Vous devez vous mettre d'accord sur la répartition des 50% restants.

` +
          `**Trésor à répartir :** ${remaining} $

` +
          `**Part de ${userObj.username} :** ${pUser}% (${userShare} $)
` +
          `**Part de ${partnerObj.username} :** ${pPartner}% (${partnerShare} $)

` +
          `Statut : ${userAccepted ? '✅' : '❌'} ${userObj.username} | ${partnerAccepted ? '✅' : '❌'} ${partnerObj.username}`)
          .setFooter({text: 'Les deux partenaires doivent accepter. Toute modification annule les accords.'});
         return embed;
      };

      const generateRows = () => {
         const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
             new ButtonBuilder().setCustomId('div_minus_10').setLabel('◀ -10% pour ' + userObj.username).setStyle(ButtonStyle.Secondary).setDisabled(percentageUser <= 0),
             new ButtonBuilder().setCustomId('div_plus_10').setLabel('▶ +10% pour ' + userObj.username).setStyle(ButtonStyle.Secondary).setDisabled(percentageUser >= 100)
         );
         const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
             new ButtonBuilder().setCustomId('div_accept').setLabel('✔️ Accepter le partage').setStyle(ButtonStyle.Success),
             new ButtonBuilder().setCustomId('div_deny').setLabel('❌ Annuler').setStyle(ButtonStyle.Danger)
         );
         return [row1, row2];
      };

      const msg = await interaction.editReply({
        content: `<@${partner.discordId}>, <@${userId}> demande la dissolution de votre union.`,
        embeds: [generateEmbed()],
        components: generateRows()
      });

      const collector = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === userId || i.user.id === partner.discordId,
        time: 120000,
      });

      collector.on('collect', async (i) => {
        if (i.customId === 'div_deny') {
          await i.update({
            content: '',
            embeds: [new EmbedBuilder().setColor(COLORS.INFO).setDescription(`❌ <@${i.user.id}> a annulé le divorce. L'union est maintenue.`)],
            components: []
          });
          collector.stop('denied');
          return;
        }

        if (i.customId === 'div_minus_10' || i.customId === 'div_plus_10') {
           userAccepted = false;
           partnerAccepted = false;
           if (i.customId === 'div_minus_10') percentageUser = Math.max(0, percentageUser - 10);
           if (i.customId === 'div_plus_10') percentageUser = Math.min(100, percentageUser + 10);
           
           await i.update({ embeds: [generateEmbed()], components: generateRows() });
           return;
        }

        if (i.customId === 'div_accept') {
          if (i.user.id === userId) userAccepted = true;
          else if (i.user.id === partner.discordId) partnerAccepted = true;

          if (userAccepted && partnerAccepted) {
            await i.deferUpdate();
            // Execution du divorce
            const refreshFamille = await prisma.famille.findUnique({ where: { id: user.famille_id! } });
            if (!refreshFamille) return;
            
            const currTotal = refreshFamille.argent_commun;
            const currDestroyed = currTotal / BigInt(2);
            const currRemaining = currTotal - currDestroyed;
            
            const userMoney = (currRemaining * BigInt(percentageUser)) / BigInt(100);
            const partnerMoney = currRemaining - userMoney;

            const inventaire_obj = refreshFamille.inventaire_commun as Record<string, number> || {};
            const divided_inventory_user: Record<string, number> = {};
            const divided_inventory_partner: Record<string, number> = {};
            
            Object.keys(inventaire_obj).forEach((item) => {
              const totalItem = inventaire_obj[item];
              const remainingItem = Math.max(0, totalItem - Math.floor(totalItem / 2));
              
              const userItemCount = Math.floor((remainingItem * percentageUser) / 100);
              const partnerItemCount = remainingItem - userItemCount;
              
              if (userItemCount > 0) divided_inventory_user[item] = userItemCount;
              if (partnerItemCount > 0) divided_inventory_partner[item] = partnerItemCount;
            });

            await prisma.user.update({
              where: { discordId: userId },
              data: {
                argent_perso: userMoney,
                inventaire: divided_inventory_user as any,
                famille_id: null,
              },
            });

            await prisma.user.update({
              where: { discordId: partner.discordId },
              data: {
                argent_perso: partnerMoney,
                inventaire: divided_inventory_partner as any,
                famille_id: null,
              },
            });

            // Delete the Discord family role if it exists
            if (refreshFamille.role_discord_id && interaction.guild) {
              try {
                const role = await interaction.guild.roles.fetch(refreshFamille.role_discord_id);
                if (role) {
                  await role.delete('Divorce validé');
                }
              } catch (err) {
                console.error("Could not delete family role on divorce:", err);
              }
            }

            await prisma.famille.delete({ where: { id: user.famille_id!}  });

            const html = getDivorceHtml({
               user1Name: userObj.username,
               user2Name: partnerObj.username,
               total: currTotal.toString(),
               destroyed: currDestroyed.toString(),
               remaining1: `${userObj.username} + ${userMoney}`,
               remaining2: `${partnerObj.username} + ${partnerMoney}`
            });

            const imgBuffer = await renderHtmlToBuffer(html, 750, 430);
            const att = new AttachmentBuilder(imgBuffer, { name: 'divorce.png' });

            await interaction.editReply({ content: '', embeds: [], components: [], files: [att] });
            collector.stop('accepted');
          } else {
            await i.update({ embeds: [generateEmbed()], components: generateRows() });
          }
        }
      });

      collector.on('end', async (collected, reason) => {
         if (reason === 'time') {
            await interaction.editReply({ content: '', embeds: [errorEmbed('Expiré', 'La négociation de divorce a expiré.')], components: [] });
         }
      });

    } catch (e) {
      console.error(e);
      await interaction.editReply({ content: 'Erreur divorce.' });
    }
  }
};

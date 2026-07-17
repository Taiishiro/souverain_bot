import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { errorEmbed } from '../utils/embeds';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';
import { getMariageHtml } from '../utils/mariageTemplates';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marier')
    .setDescription('💍 Demande en mariage (fusionne les comptes)')
    .addUserOption((option) =>
      option
        .setName('partenaire')
        .setDescription('L\'âme à lier à la vôtre')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('nom_famille')
        .setDescription('Le nom de votre Famille/Union')
        .setRequired(true)
        .setMaxLength(30)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const user1_discord_id = interaction.user.id;
      const user2 = interaction.options.getUser('partenaire', true);
      const user2_discord_id = user2.id;
      const familleNomInput = interaction.options.getString('nom_famille', true);

      if (user1_discord_id === user2_discord_id) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Vous ne pouvez pas vous marier avec vous-même.')]
        });
      }

      const user1Data = await getOrCreateUser(user1_discord_id);
      const user2Data = await getOrCreateUser(user2_discord_id);

      // Verifier si le nom de famille existe deja
      const existingFamille = await prisma.famille.findUnique({ where: { nom: familleNomInput } });
      if (existingFamille) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Ce nom de famille est déjà pris dans le royaume.')]
        });
      }

      // Vérifier qu'ils ne sont pas déjà mariés
      if (user1Data.famille_id || user2Data.famille_id) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'L\'un de vous deux est déjà dans une union sacrée.')]
        });
      }

      // Demande en mariage
      const proposeEmbed = new EmbedBuilder()
        .setColor(COLORS.ROYALTY)
        .setTitle(`💍 DEMANDE EN MARIAGE`)
        .setDescription(`<@${user2_discord_id}>, <@${user1_discord_id}> vous demande en mariage.\n\n⚠️ **ATTENTION** : Le mariage fusionne **totalement** vos comptes (argent et inventaire). En cas de divorce, 50% du patrimoine sera **détruit**.\n\nAcceptez-vous cette union ?`);

      const acceptBtn = new ButtonBuilder()
        .setCustomId('marier_accept')
        .setLabel('💍 Accepter')
        .setStyle(ButtonStyle.Success);

      const denyBtn = new ButtonBuilder()
        .setCustomId('marier_deny')
        .setLabel('❌ Refuser')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptBtn, denyBtn);

      const msg = await interaction.editReply({
        content: `<@${user2_discord_id}>`,
        embeds: [proposeEmbed],
        components: [row]
      });

      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === user2_discord_id,
        time: 60000
      });

      collector.on('collect', async i => {
        if (i.customId === 'marier_deny') {
          await i.update({
            content: '',
            embeds: [new EmbedBuilder().setColor(COLORS.DANGER).setDescription(`❌ <@${user2_discord_id}> a refusé la demande en mariage.`)],
            components: []
          });
          collector.stop('denied');
          return;
        }

        if (i.customId === 'marier_accept') {
          await i.deferUpdate();
          
          // Recharger pour s'assurer
          const u1 = await prisma.user.findUnique({ where: { discordId: user1_discord_id } });
          const u2 = await prisma.user.findUnique({ where: { discordId: user2_discord_id } });

          if (u1?.famille_id || u2?.famille_id) {
             await i.editReply({ content: '', embeds: [errorEmbed('Erreur', 'Quelqu\'un s\'est marié entre temps.')], components: [] });
             return;
          }

          const totalMoney = u1!.argent_perso + u2!.argent_perso;
          const inv1 = (u1!.inventaire as Record<string, number>) || {};
          const inv2 = (u2!.inventaire as Record<string, number>) || {};
          const combinedInventory: Record<string, number> = {};
          Object.keys({ ...inv1, ...inv2 }).forEach((item) => {
            combinedInventory[item] = (inv1[item] || 0) + (inv2[item] || 0);
          });

          try {
          const familleNom = familleNomInput;
          
          // Création du Rôle Discord pour la Famille
          let roleId = null;
          try {
            if (interaction.guild) {
              const role = await interaction.guild.roles.create({
                name: '💍 ' + familleNom,
                reason: `Mariage de ${interaction.user.username} & ${user2.username}`,
                permissions: []
              });
              roleId = role.id;
              
              const m1 = await interaction.guild.members.fetch(user1_discord_id).catch(() => null);
              const m2 = await interaction.guild.members.fetch(user2_discord_id).catch(() => null);
              if (m1) await m1.roles.add(role);
              if (m2) await m2.roles.add(role);
            }
          } catch (err) {
            console.error("Erreur création rôle de mariage :", err);
          }

          const famille = await prisma.famille.create({
            data: {
              nom: familleNom,
              chef_id: u1!.id,
              role_discord_id: roleId,
              argent_commun: totalMoney,
              argent_record: totalMoney,
              inventaire_commun: combinedInventory as any,
            },
          });

          await prisma.user.update({
            where: { id: u1!.id },
            data: { famille_id: famille.id, argent_perso: BigInt(0), inventaire: {} as any },
          });

          await prisma.user.update({
            where: { id: u2!.id },
            data: { famille_id: famille.id, argent_perso: BigInt(0), inventaire: {} as any },
          });

          const html = getMariageHtml({ user1Name: interaction.user.username, user2Name: user2.username });
          const imgBuffer = await renderHtmlToBuffer(html, 750, 400);
          const att = new AttachmentBuilder(imgBuffer, { name: 'mariage.png' });

          await i.editReply({ content: '', embeds: [], components: [], files: [att] });
          collector.stop('accepted');
          } catch (err) {
             console.error("Erreur durant acceptation mariage :", err);
             await i.editReply({ content: "Une erreur est survenue lors de l'enregistrement de l'union.", embeds: [], components: [] });
          }
        }
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await interaction.editReply({
            content: '',
            embeds: [errorEmbed('Expiré', 'La demande a expiré.')],
            components: []
          });
        }
      });

    } catch (error) {
      console.error('Erreur /marier:', error);
      await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de créer l\'union.')], components: [] });
    }
  },
};

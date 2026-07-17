import { ChatInputCommandInteraction, UserSelectMenuInteraction, EmbedBuilder, AttachmentBuilder, Guild, Role, ChannelType, VoiceChannel, CategoryChannel, TextChannel } from 'discord.js';
import { prisma } from '../../db/prisma';
import { removeItemFromInventory, getOrCreateUser } from '../economy/handlers';
import { performPerquisition } from './handlers';
import { hasCooldown, setCooldown, getCooldownTimeRemaining, formatTimeRemaining } from '../../utils/cooldown';
import { errorEmbed, successEmbed } from '../../utils/embeds';
import { isFeatureEnabled } from '../../utils/gameConfig';
import { renderHtmlToBuffer } from '../../utils/puppeteerClient';
import { getActionResultHtml } from '../../utils/actionResultTemplate';

// -- Emprisonnement Utils
async function getOrCreatePrisonnierRole(guild: Guild): Promise<Role> {
  let role = guild.roles.cache.find(r => r.name === 'Prisonnier');
  if (!role) {
    role = await guild.roles.create({
      name: 'Prisonnier',
      color: '#000000',
      reason: 'Rôle pour le système de Cachot Royal',
    });
    for (const channel of guild.channels.cache.values()) {
      if (!channel.isThread()) {
        try { await (channel as any).permissionOverwrites.edit(role.id, { ViewChannel: false }); } catch (e) {}
      }
    }
  }
  return role;
}

export async function handleMandatUsage(interaction: UserSelectMenuInteraction, actionType: string) {
  await interaction.deferReply();
  const executorId = interaction.user.id;
  const targetId = interaction.values[0];
  const targetUserObj = await interaction.client.users.fetch(targetId).catch(() => null);

  if (!targetUserObj || targetId === executorId) {
    return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Cible invalide ou impossible de se cibler soi-même.')] });
  }

  if (actionType === 'perquisition') {
    // Check Cooldown
    if (await hasCooldown(executorId, 'perquisition')) {
      const remaining = await getCooldownTimeRemaining(executorId, 'perquisition');
      return interaction.editReply({ embeds: [errorEmbed('Cooldown actif', `⏰ Vous devez attendre **${formatTimeRemaining(remaining || 0)}** avant de perquisitionner à nouveau.`)] });
    }

    // Verify Item
    const exDb = await prisma.user.findUnique({ where: { discordId: executorId }, include: { famille: true } });
    if (!exDb) return interaction.editReply({ content: 'Erreur: Joueur introuvable.' });
    const inv = exDb.famille_id ? exDb.famille?.inventaire_commun as any : exDb.inventaire as any;
    if (!inv || !inv['Mandat de Perquisition'] || inv['Mandat de Perquisition'] <= 0) {
       return interaction.editReply({ embeds: [errorEmbed('Manque de Mandat', "Vous n'avez aucun Mandat de Perquisition dans votre inventaire.")] });
    }

    const defDb = await prisma.user.findUnique({ where: { discordId: targetId }});
    if (!defDb) {
      return interaction.editReply({ embeds: [errorEmbed('Introuvable', "Ce joueur n'a pas de compte existant.")] });
    }

    // Consume Item
    await removeItemFromInventory(exDb.id, 'Mandat de Perquisition', 1);

    // Perform
    const result = await performPerquisition(exDb.id, defDb.id);
    if (!result.success) {
      await setCooldown(executorId, 'perquisition', 24 * 60 * 60);
      return interaction.editReply({ embeds: [errorEmbed('Perquisition ratée', "Vous n'avez rien trouvé d'intéressant ou les gardes vous ont repoussé.")] });
    }

    await setCooldown(executorId, 'perquisition', 24 * 60 * 60);

    let desc = '';
    if (result.item_stolen) desc = `Vous avez saisi un **${result.item_stolen}** !`;
    else desc = `Vous avez confisqué **${result.amount_stolen?.toLocaleString()} pièces** !`;

    const html = getActionResultHtml({
      title: 'PERQUISITION',
      description: desc,
      colorHex: '#FFD700',
      
      icon: interaction.user.displayAvatarURL({ extension: 'png', size: 128 })
    });
    const buffer = await renderHtmlToBuffer(html, 800, 300);
    const attachment = new AttachmentBuilder(buffer, { name: 'perqui.png' });

    return interaction.editReply({ files: [attachment] });

  } else if (actionType === 'emprisonnement') {

    // Emprisonnement Logic
    const royaumesEnabled = await isFeatureEnabled('royaumes');
    if (!royaumesEnabled) {
      return interaction.editReply({ embeds: [errorEmbed('Désactivé', 'Le système de royaumes/cachots est désactivé.')] });
    }

    const exDb = await prisma.user.findUnique({ where: { discordId: executorId }, include: { famille: true } });
    if (!exDb) return interaction.editReply({ content: 'Erreur: Joueur introuvable.' });
    const inv = exDb.famille_id ? exDb.famille?.inventaire_commun as any : exDb.inventaire as any;
    if (!inv || !inv["Mandat d'Emprisonnement"] || inv["Mandat d'Emprisonnement"] <= 0) {
       return interaction.editReply({ embeds: [errorEmbed('Manque de Mandat', "Vous n'avez aucun Mandat d'Emprisonnement dans votre inventaire.")] });
    }

    const royaume = await prisma.royaume.findFirst({ where: { owner_id: exDb.id } });
    if (!royaume) {
      return interaction.editReply({ embeds: [errorEmbed('Non Souverain', "Vous devez posséder un Royaume (et un cachot) pour emprisonner.")] });
    }

    const targetDb = await await getOrCreateUser(targetId);
    if (!targetDb) return interaction.editReply({ content: 'Cible introuvable.' });

    // Consume item
    await removeItemFromInventory(exDb.id, "Mandat d'Emprisonnement", 1);

    // Discord Logic
    try {
      const guild = interaction.guild!;
      const targetMember = await guild.members.fetch(targetId);
      const categoryId = royaume.categorie_discord_id;
      
      const prisonRole = await getOrCreatePrisonnierRole(guild);
      
      // Let him view the vocal category where the kingdom is
      // We will try giving him view + connect to the exact vocal channel 
      // (because kingdoms now use a single vocal channel `vocalId`)
      const salonsJson = royaume.salons_json as any;
      if (salonsJson && salonsJson.vocal) {
         try {
           const voc = guild.channels.cache.get(salonsJson.vocal) as VoiceChannel;
           if (voc) {
             await voc.permissionOverwrites.edit(prisonRole.id, {
                ViewChannel: true,
                Connect: true,
                Speak: false // Prisoner can't speak? Or can he?
             });
           }
         } catch(e){}
      }

      await targetMember.roles.add(prisonRole);
      
      // Move member if in vocal
      if (targetMember.voice.channel && salonsJson && salonsJson.vocal) {
        await targetMember.voice.setChannel(salonsJson.vocal).catch(()=>null);
      }

      const html = getActionResultHtml({
        title: 'EMPRISONNEMENT',
        description: `${targetUserObj.username} a été jeté(e) aux fers !`,
        colorHex: '#800000',
        
        icon: targetUserObj.displayAvatarURL({ extension: 'png', size: 128 })
      });

      const buffer = await renderHtmlToBuffer(html, 800, 300);
      const attachment = new AttachmentBuilder(buffer, { name: 'prison.png' });

      await interaction.editReply({ files: [attachment] });

    } catch (err) {
      console.error(err);
      return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de capturer le joueur (permissions Discord ?)')] });
    }
  }
}

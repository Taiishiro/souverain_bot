import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, Role, Guild, ChannelType, VoiceChannel, CategoryChannel, TextChannel } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { imprisonmentEmbed, errorEmbed, successEmbed } from '../utils/embeds';
import { isFeatureEnabled } from '../utils/gameConfig';

/**
 * Fonction utilitaire pour récupérer ou créer le rôle Prisonnier global
 * et lui refuser la vue sur tous les salons sauf ceux spécifiés plus tard.
 */
async function getOrCreatePrisonnierRole(guild: Guild): Promise<Role> {
  let role = guild.roles.cache.find(r => r.name === 'Prisonnier');
  if (!role) {
    role = await guild.roles.create({
      name: 'Prisonnier',
      color: '#000000',
      reason: 'Rôle pour le système de Cachot Royal',
    });

    // Priver ce rôle de la vue sur tous les salons actuels
    for (const channel of guild.channels.cache.values()) {
      if (!channel.isThread()) {
        try {
          await (channel as any).permissionOverwrites.edit(role.id, { ViewChannel: false });
        } catch (e) {
          // Ignorer les salons non modifiables
        }
      }
    }
  }
  return role;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emprisonner')
    .setDescription("⛓️ Mandat d'Emprisonnement : Enfermer un sujet dans vos cachots (Souverain)")
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('La cible de votre courroux')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('raison')
        .setDescription("Motif de l'emprisonnement")
        .setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      if (!await isFeatureEnabled('combat')) {
        return await interaction.editReply({
          embeds: [errorEmbed('Désactivé', '⚔️ Le système de conflit est désactivé.')],
        });
      }

      const targetUser = interaction.options.getUser('utilisateur', true);
      const raison = interaction.options.getString('raison') || 'Haute Trahison';
      
      const executorId = interaction.user.id;
      const targetId = targetUser.id;

      if (executorId === targetId) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Vous ne pouvez pas vous emprisonner vous-même !')],
        });
      }

      const targetMember = await interaction.guild?.members.fetch(targetId).catch(() => null);
      if (!targetMember) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', "Cet utilisateur n'est pas sur le serveur.")],
        });
      }

      const executorDb = await prisma.user.findUnique({
        where: { discordId: executorId },
        include: { famille: { include: { membres: true } } }
      });
      
      if (!executorDb) {
         return await interaction.editReply({ embeds: [errorEmbed('Erreur', 'Impossible de trouver vos donnees.')] });
      }
      
      const inv = executorDb.famille_id && executorDb.famille 
        ? executorDb.famille.inventaire_commun as Record<string, number> 
        : executorDb.inventaire as Record<string, number>;
        
      const mandatCount = inv ? inv["Mandat d'Emprisonnement"] || 0 : 0;
      
      if (mandatCount <= 0) {
        return await interaction.editReply({ embeds: [errorEmbed('Artefact Manquant', "Vous devez posséder un **Mandat d'Emprisonnement** (achetable en Boutique) pour emprisonner un joueur.")] });
      }

      // Vérifier si l'exécuteur possède un royaume
      let royaume = await prisma.royaume.findFirst({
        where: { owner_id: executorDb.id }
      });
      
      if (!royaume && executorDb.famille) {
        const partner = executorDb.famille.membres.find(m => m.discordId !== executorId);
        if (partner) {
            royaume = await prisma.royaume.findFirst({ where: { owner_id: partner.id } });
        }
      }

      if (!royaume) {
        return await interaction.editReply({
          embeds: [errorEmbed('Accès Refusé', "👑 Vous devez posséder un Royaume pour emprisonner quelqu'un.")],
        });
      }

      // Récupérer le #cachot du Royaume
      let salonsJson: any = royaume.salons_json;
      if (typeof salonsJson === 'string') salonsJson = JSON.parse(salonsJson);

      const cachotId = salonsJson.cachot;
      if (!cachotId) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur Structurelle', 'Votre royaume ne possède pas de Cachot enregistré.')],
        });
      }

      const cachotChannel = interaction.guild?.channels.cache.get(cachotId);
      if (!cachotChannel) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Le salon Cachot physique est introuvable sur le serveur.')],
        });
      }

      // Vérifier si la cible n'est pas déjà en prison
      const existingPrison = await prisma.emprisonnement.findFirst({
        where: { prisonnier_id: targetId }
      });

      if (existingPrison) {
        return await interaction.editReply({
          embeds: [errorEmbed('Déjà Emprisonné', 'Cette âme croupit déjà dans un cachot.')],
        });
      }

      // 0. Consommer le Mandat d'Emprisonnement
      const newInv = { ...inv };
      newInv["Mandat d'Emprisonnement"] -= 1;
      if (newInv["Mandat d'Emprisonnement"] <= 0) delete newInv["Mandat d'Emprisonnement"];
      
      if (executorDb.famille_id) {
        await prisma.famille.update({
          where: { id: executorDb.famille_id },
          data: { inventaire_commun: newInv }
        });
      } else {
        await prisma.user.update({
          where: { discordId: executorId },
          data: { inventaire: newInv }
        });
      }

      // 1. Obtenir le rôle Prisonnier et l'ajouter à la cible
      const prisonnierRole = await getOrCreatePrisonnierRole(interaction.guild!);
      await targetMember.roles.add(prisonnierRole);

      // 2. Donner la permission exclusive sur ce #cachot spécifique pour la cible
      // On utilise l'ID du membre pour qu'il puisse voir CE cachot (et pas les cachots des autres royaumes)
      await (cachotChannel as any).permissionOverwrites.edit(targetMember.id, {
        ViewChannel: true,
        Connect: true,
        Speak: true,
        SendMessages: true
      });

      // 3. Déplacer l'utilisateur en vocal si possible
      if (targetMember.voice.channel && cachotChannel.isVoiceBased()) {
        try {
          await targetMember.voice.setChannel(cachotChannel as VoiceChannel);
        } catch (e) {
          console.error("Impossible de déplacer en vocal (peut-être pas les permissions ou cible déconnectée)", e);
        }
      }

      // Enregistrer en DB (1h de prison par défaut)
      const libererA = new Date();
      libererA.setHours(libererA.getHours() + 1);

      await prisma.emprisonnement.create({
        data: {
          prisonnier_id: targetId,
          royaume_id: royaume.id,
          raison,
          vocal_id: cachotId,
          libere_a: libererA
        }
      });

      const embed = imprisonmentEmbed(
        targetUser.username,
        raison,
        royaume.nom,
        libererA
      );

      await interaction.editReply({ embeds: [embed] });

      // Envoyer un message dans le cachot
      if (cachotChannel.isTextBased()) {
         try {
            await cachotChannel.send({
              content: `<@${targetId}>`,
              embeds: [errorEmbed('⛓️ Au Cachot !', `Vous avez été enfermé ici par le Souverain de **${royaume.nom}**.\nRaison: *${raison}*\nLibération: <t:${Math.floor(libererA.getTime() / 1000)}:R>`)] });
         } catch (e) {}
      }

    } catch (error) {
      console.error('Erreur /emprisonner:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', "Impossible d'émettre le mandat d'arrêt.")],
      });
    }
  },
};

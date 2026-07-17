import { prisma } from '../../db/prisma';
import { Client, CategoryChannel, ChannelType, PermissionFlagsBits } from 'discord.js';

/**
 * Crée un nouveau royaume (avec canaux Discord)
 */
export async function createRoyaume(
  nom: string,
  owner_id: string,
  guild_id: string,
  client: Client
) {
  const guild = client.guilds.cache.get(guild_id);
  if (!guild) return null;

  try {
    // Créer la catégorie Discord
    const category = (await guild.channels.create({
      name: nom.toUpperCase(),
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: client.user!.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.MoveMembers,
          ]
        },
        {
          id: owner_id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers,
            PermissionFlagsBits.MoveMembers,
            PermissionFlagsBits.UseVAD,
          ],
        },
      ],
    })) as CategoryChannel;

    // Créer le canal vocal principal
    const voiceChannel = await guild.channels.create({
      name: '🏰 Salle du Trône',
      type: ChannelType.GuildVoice,
      parent: category.id,
      userLimit: 10, // Limite pour créer une ambiance royale
    });

    // Créer le rôle du royaume
    const roleRoyaume = await guild.roles.create({
      name: `👑 Souverain de ${nom}`,
      color: '#FFD700',
      permissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.UseVAD,
      ],
    });

    // Donner le rôle au propriétaire
    const owner = await guild.members.fetch(owner_id);
    if (owner) {
      await owner.roles.add(roleRoyaume);
    }

    // Créer le royaume en DB
    const royaume = await prisma.royaume.create({
      data: {
        nom,
        owner_id,
        puissance: BigInt(0),
        categorie_discord_id: category.id,
        salons_json: {
          voice: voiceChannel.id,
        },
      },
    });

    return {
      royaume,
      roleId: roleRoyaume.id,
      categoryId: category.id,
      voiceChannelId: voiceChannel.id,
    };
  } catch (error) {
    console.error('Erreur création royaume:', error);
    return null;
  }
}

/**
 * Obtient un royaume par ID
 */
export async function getRoyaumeById(id: string) {
  return prisma.royaume.findUnique({
    where: { id },
  });
}

/**
 * Obtient le royaume d'un propriétaire
 */
export async function getRoyaumeByOwner(owner_id: string) {
  return prisma.royaume.findFirst({
    where: { owner_id },
  });
}

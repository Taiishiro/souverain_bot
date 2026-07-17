import { Client, TextChannel, Role, ChannelType, PermissionFlagsBits } from 'discord.js';

export async function createSouverainRole(
  client: Client,
  guildId: string,
  nom: string,
  ownerId: string
): Promise<string> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error(`Guild ${guildId} not found`);
  }

  let roleId = '';

  try {
    const role = await guild.roles.create({
      name: `Roi de ${nom}`,
      color: 0xb8860b, // Or Terni
      reason: `Création Royaume ${nom}`,
      permissions: [],
    });
    roleId = role.id;

    const member = await guild.members.fetch(ownerId).catch(()=>null);
    if (member) {
      await member.roles.add(role).catch(err => console.error("Could not assign kingdom role:", err));
    }
  } catch (error) {
    console.error("Erreur Discord API createSouverainRole:", error);
    // On ne bloque pas la création du royaume en base si on n'a pas les perms Discord
  }

  return roleId;
}

export async function createRoyaumeVocal(
  client: Client,
  guildId: string,
  nom: string,
  pseudo: string,
  roleId: string,
  typeRoyaume: 'Frontalier' | 'Principal'
): Promise<string> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error(`Guild ${guildId} not found`);
  }

  let vocalId = '';
  try {
    const categoryName = typeRoyaume === 'Frontalier' ? 'Royaume Frontaliers' : 'Royaume Principal';
    let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === categoryName.toLowerCase());

    if (!category) {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory
      });
    }

                const overwrites = [];
    if (roleId) {
        overwrites.push({
            id: roleId,
            allow: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.Stream,
              PermissionFlagsBits.UseVAD,
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageRoles,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
              PermissionFlagsBits.MoveMembers,
            ],
        });
    }

    const options: any = {
      name: `${nom} [${typeRoyaume === 'Principal' ? 5 : 3}/${typeRoyaume === 'Principal' ? 5 : 3} PV]`,
      type: ChannelType.GuildVoice,
      parent: category.id,
    };
    
    if (overwrites.length > 0) {
       options.permissionOverwrites = overwrites;
    }
    const vocalChannel = await guild.channels.create(options);
    
    vocalId = vocalChannel.id;
  } catch (error) {
    console.error("Erreur Discord API createRoyaumeVocal:", error);
  }

  return vocalId;
}

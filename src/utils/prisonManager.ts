import { Guild, ChannelType, PermissionsBitField, CategoryChannel, TextChannel, VoiceChannel, Role } from 'discord.js';

export async function setupPrison(guild: Guild) {
  try {
    // 1. Chercher ou Créer le rôle Prisonnier
    let prisonRole = guild.roles.cache.find(r => r.name === 'Prisonnier');
    if (!prisonRole) {
      prisonRole = await guild.roles.create({
        name: 'Prisonnier',
        color: '#ff0000', // Rouge pour bien le voir
        reason: 'Rôle pour les joueurs emprisonnés',
      });
      console.log(`[Prison] Rôle Prisonnier créé dans ${guild.name}`);
    }

    // 2. Chercher ou Créer la Catégorie Prison
    let prisonCategory = guild.channels.cache.find(c => c.name === '🔒 Prison' && c.type === ChannelType.GuildCategory) as CategoryChannel;
    if (!prisonCategory) {
      prisonCategory = await guild.channels.create({
        name: '🔒 Prison',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: prisonRole.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
          },
        ],
      }) as CategoryChannel;
      console.log(`[Prison] Catégorie Prison créée dans ${guild.name}`);
    }

    // 3. Chercher ou Créer le channel Texte (Cellule)
    let prisonText = guild.channels.cache.find(c => c.name === 'cellule' && c.parentId === prisonCategory?.id) as TextChannel;
    if (!prisonText) {
      await guild.channels.create({
        name: 'cellule',
        type: ChannelType.GuildText,
        parent: prisonCategory.id,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: prisonRole.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          },
        ],
      });
      console.log(`[Prison] Channel cellule créé dans ${guild.name}`);
    }

    // 4. Chercher ou Créer le channel Vocal (Parloir)
    let prisonVoice = guild.channels.cache.find(c => c.name === 'parloir' && c.parentId === prisonCategory?.id) as VoiceChannel;
    if (!prisonVoice) {
      await guild.channels.create({
        name: 'parloir',
        type: ChannelType.GuildVoice,
        parent: prisonCategory.id,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: prisonRole.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
          },
        ],
      });
      console.log(`[Prison] Channel vocal parloir créé dans ${guild.name}`);
    }

    // 5. Appliquer l'isolation : Le rôle Prisonnier ne doit voir RIEN D'AUTRE
    for (const [id, channel] of guild.channels.cache) {
      // Ignorer la catégorie prison et ses enfants
      if (id === prisonCategory.id || channel.parentId === prisonCategory.id) continue;
      if (channel.isThread()) continue;
      
      // On vérifie si y'a déjà un deny pour ViewChannel pour pas spammer l'API Discord
      const currentOverwrite = channel.permissionOverwrites.cache.get(prisonRole.id);
      if (!currentOverwrite || !currentOverwrite.deny.has(PermissionsBitField.Flags.ViewChannel)) {
        try {
          await channel.permissionOverwrites.edit(prisonRole.id, {
            ViewChannel: false
          });
        } catch (e) {
          // Ignorer les erreurs de permissions sur certains salons spéciaux
        }
      }
    }

    // 5. Appliquer l'isolation : Le rôle Prisonnier ne doit voir RIEN D'AUTRE
    for (const [id, channel] of guild.channels.cache) {
      // Ignorer la catégorie prison et ses enfants
      if (id === prisonCategory.id || channel.parentId === prisonCategory.id) continue;
      if (channel.isThread()) continue;
      
      // On vérifie si y'a déjà un deny pour ViewChannel pour pas spammer l'API Discord
      const currentOverwrite = channel.permissionOverwrites.cache.get(prisonRole.id);
      if (!currentOverwrite || !currentOverwrite.deny.has(PermissionsBitField.Flags.ViewChannel)) {
        try {
          await channel.permissionOverwrites.edit(prisonRole.id, {
            ViewChannel: false
          });
        } catch (e) {
          // Ignorer les erreurs de permissions sur certains salons spéciaux
        }
      }
    }
  } catch (error) {


    console.error(`[Prison] Erreur lors de l'initialisation de la prison sur ${guild.name}:`, error);
  }
}

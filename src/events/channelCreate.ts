import { Events, ChannelType, PermissionsBitField, CategoryChannel, NonThreadGuildBasedChannel } from 'discord.js';

module.exports = {
  name: Events.ChannelCreate,
  async execute(channel: NonThreadGuildBasedChannel) {
    if (!channel.guild) return;

    try {
      const prisonRole = channel.guild.roles.cache.find(r => r.name === 'Prisonnier');
      if (!prisonRole) return;

      const prisonCategory = channel.guild.channels.cache.find(c => c.name === '🔒 Prison' && c.type === ChannelType.GuildCategory);
      
      // Si la catégorie Prison est en train d'être créée, ou si ce salon est dans la prison, on ignore.
      if (channel.id === prisonCategory?.id || channel.parentId === prisonCategory?.id) {
          return;
      }

      // Ajouter l'overwrite local au salon fraîchement créé pour l'isoler du Prisonnier
      await channel.permissionOverwrites.edit(prisonRole.id, {
        ViewChannel: false
      });
      
      console.log(`[Prison Isolation] Le rôle Prisonnier a été bloqué pour le nouveau salon : ${channel.name}`);
    } catch (e) {
      console.error(`[Prison Isolation] Erreur lors de l'isolation du nouveau salon ${channel.name} :`, e);
    }
  },
};

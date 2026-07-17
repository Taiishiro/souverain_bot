import { Events, Guild } from 'discord.js';
import { setupPrison } from '../utils/prisonManager';

module.exports = {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    console.log(`Nouveau serveur rejoint: ${guild.name}`);
    await setupPrison(guild);
  },
};

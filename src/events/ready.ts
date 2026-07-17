import { Events, Client } from 'discord.js';
import { initializeShopItems } from '../features/economy/shopInitialize';
import { setupPrison } from '../utils/prisonManager';

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`👑 Bot prêt! Connecté en tant que ${client.user?.tag}`);
    await initializeShopItems();

    // Check configuration for already joined guilds
    for (const guild of client.guilds.cache.values()) {
        try {
            await setupPrison(guild);
        } catch (err) {
            console.error(`Impossible de configurer la prison sur ${guild.name}`, err);
        }
    }
  },
};

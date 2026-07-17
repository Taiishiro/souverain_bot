import { Events } from 'discord.js';

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member: any) {
    console.log(`👤 ${member.user.tag} a quitté le serveur`);

    // TODO: Implémenter l'héritage/enchères
    // - Si user a une famille: transférer ses dragons/argent à la famille
    // - Si user est solo: créer un canal d'enchères
  },
};

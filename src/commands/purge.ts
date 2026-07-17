import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Client } from 'discord.js';
import { prisma } from '../db/prisma';
import { setConfig } from '../utils/gameConfig';
import { updateRoyaumeNameDiscord } from '../features/royaumes/updatePv';

const command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('⏳ (ADMIN) Déclenche La Purge : Tous les royaumes tombent en PV et perdent leurs bonus de défense.')
    .addIntegerOption((option: any) =>
      option.setName('duree')
        .setDescription('Durée de la Purge en minutes')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "Vous n'avez pas la permission.", ephemeral: true });
    }

    const dureeMin = interaction.options.getInteger('duree')!;
    const endTimestamp = Date.now() + dureeMin * 60 * 1000;

    await interaction.deferReply(); // It might take time to rename all voice channels

    try {
      // 1. Sauvegarder l'heure de fin en DB
      await setConfig('purge_end_time', endTimestamp.toString(), 'Timestamp de fin de la purge (minutes)', 'events');

      // 2. Sauvegarder l'état actuel des royaumes
      const royaumes = await prisma.royaume.findMany();
      const snapshot = royaumes.map(r => ({ id: r.id, pv: r.pv, owner_id: r.owner_id }));
      await setConfig('purge_pv_snapshot', JSON.stringify(snapshot), 'Snapshot des PV avant la purge', 'events');
      
      // 3. Modifier les PV de tous les royaumes
      let updatedCount = 0;

      for (const royaume of royaumes) {
         let newPv = royaume.pv;
         
         if (royaume.type === 'Frontalier') {
             newPv = 1;
         } else if (royaume.type === 'Principal') {
             newPv = 2; // 2 au lieu de 5
         } else {
             // S'il n'y a pas de type ou c'est un autre type, on met aussi à 1 par defaut
             newPv = 1;
         }

         if (newPv !== royaume.pv) {
             // Mettre à jour en BDD
             await prisma.royaume.update({
                 where: { id: royaume.id },
                 data: { pv: newPv }
             });
             
             // Mettre à jour le nom du salon sur Discord (en async lent par l'API)
             await updateRoyaumeNameDiscord(client, { ...royaume, pv: newPv });
             updatedCount++;
         }
      }

      // 4. Annoncer publiquement la Purge
      const embed = new EmbedBuilder()
        .setTitle('🩸 LA PURGE A COMMENCÉ ! 🩸')
        .setDescription(`⚠️ **Alerte Générale** ⚠️\n\nUne purge a été déclenchée pour **${dureeMin} minutes** !\n\n${Array.from({length: 3}).map(()=>"🔥").join(' ')} **Nouveaux PV des Royaumes** :\n- **Frontaliers** : Tombés à \`1 PV\` (One-shot !)\n- **Principaux** : Tombés à \`2 PV\`\n\n🛡️ **Désactivation des Défenses** :\nDurant cette purge, les assiégés ne bénéficient plus de leur bonus de \`+20% de puissance\` lors des attaques territoriales !\n\nLa Purge se terminera <t:${Math.floor(endTimestamp / 1000)}:R>. Sortez vos armées !`)
        .setColor('#8B0000') // Dark Red
        .setTimestamp();

      await interaction.editReply({ 
        content: "@everyone", 
        embeds: [embed] 
      });

    } catch (error) {
      console.error("Purge Error:", error);
      await interaction.editReply({ content: "❌ Une erreur est survenue pendant le lancement de la purge." });
    }
  },
};

export default command;

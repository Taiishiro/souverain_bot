import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { getAliveDragonsForUser } from '../features/dragons/handlers';
import { executeCombat } from '../features/combat/handlers';
import { updateRoyaumeNameDiscord } from '../features/royaumes/updatePv';
import { getConfig } from '../utils/gameConfig';
import { errorEmbed } from '../utils/embeds';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { getCombatReportHtml } from '../utils/combatReportTemplate';
import { getCombatPhaseHtml } from '../utils/combatPhaseTemplate';
import { AttachmentBuilder } from 'discord.js';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';

const ATTACK_COOLDOWN_HOURS = 2; // Cooldown d'attaque

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attaque')
    .setDescription('⚔️ Lance une assaut avec vos créatures')
    .addUserOption((option) =>
      option
        .setName('cible')
        .setDescription('L\'utilisateur à attaquer')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Mode de combat')
        .setRequired(false)
        .addChoices(
          { name: 'PILLAGE (Vol Or + Dégâts)', value: 'pillage' },
          { name: 'SIÈGE (Conquête Royaume + Dégâts - Peu d\'Or)', value: 'siege' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('royaume')
        .setDescription('Nom exact du royaume à viser (pour SIÈGE)')
        .setRequired(false)
        .setAutocomplete(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const attacker_discord_id = interaction.user.id;
      const defender_discord = interaction.options.getUser('cible', true);
      const defender_discord_id = defender_discord.id;
      const mode = interaction.options.getString('mode') || 'pillage';
      const target_royaume_id = interaction.options.getString('royaume');

      if (attacker_discord_id === defender_discord_id) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.INFO)
              .setTitle(`${EMOJIS.SWORD} AUTO-DESTRUCTION INTERDITE`)
              .setDescription(
                `${SEPARATORS.SECTION}\n` +
                `Vous ne pouvez pas vous attaquer vous-même.\n` +
                `${SEPARATORS.SECTION}`
              ),
          ],
        });
      }

      // Vérifier le cooldown d'attaque
      const cooldown = await prisma.cooldownPersistent.findUnique({
        where: {
          user_id_action_type: {
            user_id: attacker_discord_id,
            action_type: 'attack',
          },
        },
      });

      if (cooldown && cooldown.available_at > new Date()) {
        const remainingMs = cooldown.available_at.getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / 60000);
        
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.DANGER)
              .setTitle(`${EMOJIS.CHAIN} EN COOLDOWN`)
              .setDescription(
                `${SEPARATORS.SECTION}\n` +
                `Vous êtes trop fatigué pour combattre.\n` +
                `└> Revient dans: ${remainingMins} minutes\n\n` +
                `*Astuce: Vous pouvez acheter et utiliser un **Élixir de Combat** dans la \`/boutique\` pour réinitialiser ce délai.*\n` +
                `${SEPARATORS.SECTION}`
              ),
          ],
        });
      }

      // Créer les users
      console.log('DEBUG: start getOrCreateUser');
      const attacker = await getOrCreateUser(attacker_discord_id);
      const defender = await getOrCreateUser(defender_discord_id);

      // Récupérer SEULEMENT les dragons vivants
      const attacker_dragons = (await getAliveDragonsForUser(attacker.id)).filter(d => !d.alliance_id);
      let defender_dragons = (await getAliveDragonsForUser(defender.id)).filter(d => !d.alliance_id);
      
      if (defender.alliance_id) {
        const alliance_dragons = await prisma.dragon.findMany({
          where: { alliance_id: defender.alliance_id, etat: 'Vivant' },
        });
        defender_dragons.push(...alliance_dragons);
      }

      if (attacker_dragons.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.DEATH)
              .setTitle(`${EMOJIS.DRAGON_SKELETON} AUCUNE CRÉATURE VIVANTE`)
              .setDescription(
                `${SEPARATORS.SECTION}\n` +
                `Vous n'avez pas de dragon vivant pour combattre.\n` +
                `${EMOJIS.LIST} Vous avez seulement des Squelettes\n` +
                `${SEPARATORS.SECTION}`
              ),
          ],
        });
      }

      if (defender_dragons.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.INFO)
              .setTitle(`${EMOJIS.DRAGON_SKELETON} DÉFENSEUR SANS CRÉATURES`)
              .setDescription(
                `${SEPARATORS.SECTION}\n` +
                `${defender_discord.username} n'a pas de dragon vivant.\n` +
                `${EMOJIS.LIST} Impossible de combattre\n` +
                `${SEPARATORS.SECTION}`
              ),
          ],
        });
      }

      // Vérifier l'énergie suffisante (min 50 pour combattre)
      const viable_dragons = attacker_dragons.filter((d) => d.energie_combat >= 50);

      if (viable_dragons.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.DANGER)
              .setTitle(`${EMOJIS.DRAGON_ALIVE} CRÉATURES ÉPUISÉES`)
              .setDescription(
                `${SEPARATORS.SECTION}\n` +
                `Vos créatures n'ont pas assez d'énergie.\n` +
                `${EMOJIS.LIST} Minimum requis: 50 énergie\n` +
                `${SEPARATORS.SECTION}`
              ),
          ],
        });
      }

      // --- LANCEMENT DE L'ANIMATION DE COMBAT SEQUENTIEL ---
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      
      // Exécuter le combat en background pour anticiper le résultat
      const modeCmd = (interaction as any).options?.getString('mode') || 'pillage';
      const result = await executeCombat(
        attacker.id,
        defender.id,
        viable_dragons.map((d) => d.id),
        modeCmd as 'pillage' | 'siege',
        target_royaume_id || undefined
      );

      if (!result) {
        return await interaction.editReply({
          content: null,
          embeds: [errorEmbed('Erreur', 'Erreur lors de l\'exécution du combat.')],
        });
      }

      const diff = Math.abs(result.attacker_base_power - result.defender_base_power);
      
      const advantageName = result.attacker_base_power > result.defender_base_power ? interaction.user.username : defender_discord.username;
      
      // Phase 1 : Inspection
      const phase1Html = getCombatPhaseHtml({
        percentage: 0,
        title: "L'inspection des troupes...",
        description: "Les osts se jaugent. Les armes brillent sous un ciel couvert de cendres.",
        attackerName: interaction.user.username,
        defenderName: defender_discord.username,
        attackerPower: result.attacker_base_power,
        defenderPower: result.defender_base_power,
        diffText: `Écart de Puissance : ${diff} (en faveur de ${advantageName})`
      });
      let p1Buffer = await renderHtmlToBuffer(phase1Html, 1000, 700);
      await interaction.editReply({ content: null, embeds: [], files: [new AttachmentBuilder(p1Buffer, { name: 'phase1.png' })] });
      await sleep(2500);

      // Phase 2 : Choc des métaux
      const avantage = result.attacker_final_power > result.defender_final_power ? interaction.user.username : defender_discord.username;
      const phase2Html = getCombatPhaseHtml({
        percentage: 40,
        title: "Le Choc des Métaux",
        description: `Les boucliers volent en éclats et le sang commence à couler. (${avantage} prend l'avantage massif...)`,
        attackerName: interaction.user.username,
        defenderName: defender_discord.username,
        attackerPower: result.attacker_base_power,
        defenderPower: result.defender_base_power,
        diffText: `Écart de Puissance : ${diff} (en faveur de ${advantageName})`
      });
      let p2Buffer = await renderHtmlToBuffer(phase2Html, 1000, 700);
      await interaction.editReply({ content: null, embeds: [], files: [new AttachmentBuilder(p2Buffer, { name: 'phase2.png' })] });
      await sleep(2500);

      // Phase 3 : Flammes et Miracles
      let miracleText = "Dans un rugissement assourdissant, le champ de bataille s'enflamme !";
      if (result.attacker_miracle) miracleText += `<br><br><span style="color:#dfb15b;font-size:28px;">✨ MIRACLE DU DÉSESPÉRÉ! Un cri de guerre résonne chez ${interaction.user.username}, votre force double soudainement !</span>`;
      else if (result.defender_miracle) miracleText += `<br><br><span style="color:#dfb15b;font-size:28px;">✨ MIRACLE DU DÉSESPÉRÉ! Un cri de guerre résonne chez ${defender_discord.username}, sa force double in extremis !</span>`;

      const phase3Html = getCombatPhaseHtml({
        percentage: 70,
        title: "Tourmente de Flammes",
        description: miracleText,
        attackerName: interaction.user.username,
        defenderName: defender_discord.username,
        attackerPower: result.attacker_base_power,
        defenderPower: result.defender_base_power,
        diffText: `Écart de Puissance : ${diff} (en faveur de ${advantageName})`
      });
      let p3Buffer = await renderHtmlToBuffer(phase3Html, 1000, 700);
      await interaction.editReply({ content: null, embeds: [], files: [new AttachmentBuilder(p3Buffer, { name: 'phase3.png' })] });
      await sleep(2500);

      // Phase 4 : Silence
      const phase4Html = getCombatPhaseHtml({
        percentage: 100,
        title: "Le Silence Tombe...",
        description: `La poussière retombe lentement sur les cadavres. (${result.attacker_won ? 'Victoire de Attaquant pressentie' : 'Désastre et Défaite tragique...!'})`,
        attackerName: interaction.user.username,
        defenderName: defender_discord.username,
        attackerPower: result.attacker_final_power,
        defenderPower: result.defender_final_power,
        diffText: `Puissance Finale (Après Miracles)`
      });
      let p4Buffer = await renderHtmlToBuffer(phase4Html, 1000, 700);
      await interaction.editReply({ content: null, embeds: [], files: [new AttachmentBuilder(p4Buffer, { name: 'phase4.png' })] });
      await sleep(2500);
      // Générer l'image
      const winnerName = result.attacker_won ? interaction.user.username : defender_discord.username;
      const loserName = result.attacker_won ? defender_discord.username : interaction.user.username;
      const winnerAvatarUrl = result.attacker_won 
        ? interaction.user.displayAvatarURL({ extension: 'png', size: 256 })
        : defender_discord.displayAvatarURL({ extension: 'png', size: 256 });
      
      
      // Update discord if it was a siege
      let siegeText = "";
      if (result.mode === 'siege' && result.damage_royaume && result.conquered_royaume) {
          await updateRoyaumeNameDiscord(interaction.client, result.conquered_royaume);
          const currentPv = result.conquered_royaume.pv;
          if (currentPv === (result.conquered_royaume.max_pv || 3) && result.attacker_won) { // Note: pv was reset to 3 on conquer
              siegeText = `🏰 ROYAUME CONQUIS ! L'attaquant a pris possession de ${result.conquered_royaume.nom} (0 PV atteints).`;
          } else {
              siegeText = `🔥 BRÈCHE ! Le royaume ${result.conquered_royaume.nom} perd 1 PV (reste ${currentPv}/${result.conquered_royaume.max_pv || 3}).`;
          }
      } else if (result.mode === 'siege' && !result.damage_royaume && result.attacker_won) {
          siegeText = "🛡️ VICTOIRE ! Mais le défenseur n'avait aucun royaume à endommager.";
      } else if (result.mode === 'siege' && !result.attacker_won) {
          const isPurgeActive = parseInt(await getConfig('purge_end_time', '0')) > Date.now();
          siegeText = isPurgeActive 
             ? "🛡️ ÉCHEC DU SIÈGE ! Les défenses ont tenu bon malgré la Purge !"
             : "🛡️ ÉCHEC DU SIÈGE ! Les défenses ont tenu bon (+20% puissance défenseur).";
      }

      const htmlContent = getCombatReportHtml({

        winnerAvatarUrl,
        winnerName,
        loserName,
        moneyStolen: result.money_stolen.toLocaleString(),
        dragonsKilled: result.dragons_killed,
        isAttackerWinner: result.attacker_won,
        attackerPower: Math.floor(result.attacker_final_power),
        defenderPower: Math.floor(result.defender_final_power),
        attackerName: interaction.user.username,
        defenderName: defender_discord.username,
        killedDragonNames: (result as any).killed_dragon_names || [],
        puinesKilled: result.puines_killed || 0,
        siegeText,
      });

      const imageBuffer = await renderHtmlToBuffer(htmlContent, 1000, 600);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'rapport-de-sang.png' });



      // Définir le cooldown d'attaque
      const nextAvailable = new Date(Date.now() + ATTACK_COOLDOWN_HOURS * 3600000);
      await prisma.cooldownPersistent.upsert({
        where: {
          user_id_action_type: {
            user_id: attacker_discord_id,
            action_type: 'attack',
          },
        },
        update: { available_at: nextAvailable },
        create: {
          user_id: attacker_discord_id,
          action_type: 'attack',
          available_at: nextAvailable,
        },
      });

      await interaction.editReply({ content: null, embeds: [], files: [attachment] });
    } catch (error) {
      console.error('Erreur /attaque:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible d\'exécuter le combat.')],
      });
    }
  },
};

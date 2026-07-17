import cron from 'node-cron';
import { Client } from 'discord.js';
import { prisma } from '../db/prisma';
import { updateRoyaumeNameDiscord } from '../features/royaumes/updatePv';
import { getConfig, setConfig } from '../utils/gameConfig';


import { reduceAllDragonsHunger } from '../features/dragons/handlers';
import { restoreAllDragonsEnergy } from '../features/dragons/handlers';
import { ageAndEvolveDragons } from '../features/dragons/handlers';

/**
 * Initialise les tâches planifiées
 */
export function initializeCronJobs(client: Client) {
  console.log('🕐 Initialisation des cron jobs...');

  // Toutes les heures: Faim -2
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await reduceAllDragonsHunger(2);
      console.log(`✅ Cron: Faim réduite pour ${count} dragons`);
    } catch (error) {
      console.error('❌ Erreur cron faim:', error);
    }
  });

  // Toutes les 30 minutes: Énergie +5
  cron.schedule('*/30 * * * *', async () => {
    try {
      const count = await restoreAllDragonsEnergy(5);
      console.log(`✅ Cron: Énergie restaurée pour ${count} dragons`);
    } catch (error) {
      console.error('❌ Erreur cron énergie:', error);
    }
  });

  // Tous les jours à minuit: Aging des dragons
  cron.schedule('0 0 * * *', async () => {
    try {
      const count = await ageAndEvolveDragons();
      console.log(`✅ Cron: ${count} dragons vieillis et évolutés`);
    } catch (error) {
      console.error('❌ Erreur cron aging:', error);
    }
  });

  // Toutes les minutes: Libération auto des prisonniers
  cron.schedule('* * * * *', async () => {
    try {
      const expiredPrisons = await prisma.emprisonnement.findMany({
        where: { libere_a: { lte: new Date() } }
      });
      
      for (const prison of expiredPrisons) {
        for (const guild of client.guilds.cache.values()) {
          const member = await guild.members.fetch(prison.prisonnier_id).catch(() => null);
          if (member) {
            const prisonnierRole = guild.roles.cache.find(r => r.name === 'Prisonnier');
            if (prisonnierRole) await member.roles.remove(prisonnierRole).catch(()=>null);
            
            const cachotChannel = guild.channels.cache.get(prison.vocal_id);
            if (cachotChannel) {
              await (cachotChannel as any).permissionOverwrites.delete(member.id).catch(()=>null);
              if (member.voice.channelId === cachotChannel.id) {
                await member.voice.disconnect().catch(()=>null);
              }
            }
          }
        }
        await prisma.emprisonnement.delete({ where: { id: prison.id } });
        console.log(`🕊️ Libération auto pour: ${prison.prisonnier_id}`);
      }
    } catch (error) {
      console.error('❌ Erreur cron libération:', error);
    }
  });


  // Toutes les minutes: Fin de la Purge
  cron.schedule('* * * * *', async () => {
    try {
      const purgeEndTimeStr = await getConfig('purge_end_time');
      if (purgeEndTimeStr && parseInt(purgeEndTimeStr) > 0) {
        if (Date.now() >= parseInt(purgeEndTimeStr)) {
          console.log("🩸 Fin de la Purge détectée. Restauration des Royaumes...");
          
          // Disable purge
          await setConfig('purge_end_time', '0');
          
          // Restore
          const snapshotStr = await getConfig('purge_pv_snapshot');
          if (snapshotStr && snapshotStr !== '[]') {
            const snapshot = JSON.parse(snapshotStr);
            let restoredCount = 0;
            
            for (const snap of snapshot) {
              const currentRoyaume = await prisma.royaume.findUnique({ where: { id: snap.id } });
              
              // Seulement si le royaume n'a pas été conquis (owner le même)
              if (currentRoyaume && currentRoyaume.owner_id === snap.owner_id) {
                // Et si les PV du snapshot sont bien supérieurs aux PV actuels
                // (On ne redonne les PV que s'il faut, s'il a pris des dégâts qui le mettraient encore plus bas, ou s'il s'est soigné)
                // Généralement on le remet juste exactement au snapshot
                if (currentRoyaume.pv < snap.pv) {
                  await prisma.royaume.update({
                    where: { id: snap.id },
                    data: { pv: snap.pv }
                  });
                  await updateRoyaumeNameDiscord(client, { ...currentRoyaume, pv: snap.pv });
                  restoredCount++;
                }
              }
            }
            console.log(`✅ ${restoredCount} Royaumes ont récupéré leurs PV d'origine !`);
            // Clear snapshot
            await setConfig('purge_pv_snapshot', '[]');
            
            // Optionally, announce in a channel (hard since we don't know which one, but we can log)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur cron fin purge:', error);
    }
  });


  // Toutes les minutes: Fin de la Purge
  cron.schedule('* * * * *', async () => {
    try {
      const purgeEndTimeStr = await getConfig('purge_end_time');
      if (purgeEndTimeStr && parseInt(purgeEndTimeStr) > 0) {
        if (Date.now() >= parseInt(purgeEndTimeStr)) {
          console.log("🩸 Fin de la Purge détectée. Restauration des Royaumes...");
          
          // Disable purge
          await setConfig('purge_end_time', '0');
          
          // Restore
          const snapshotStr = await getConfig('purge_pv_snapshot');
          if (snapshotStr && snapshotStr !== '[]') {
            const snapshot = JSON.parse(snapshotStr);
            let restoredCount = 0;
            
            for (const snap of snapshot) {
              const currentRoyaume = await prisma.royaume.findUnique({ where: { id: snap.id } });
              
              // Seulement si le royaume n'a pas été conquis (owner le même)
              if (currentRoyaume && currentRoyaume.owner_id === snap.owner_id) {
                // Et si les PV du snapshot sont bien supérieurs aux PV actuels
                // (On ne redonne les PV que s'il faut, s'il a pris des dégâts qui le mettraient encore plus bas, ou s'il s'est soigné)
                // Généralement on le remet juste exactement au snapshot
                if (currentRoyaume.pv < snap.pv) {
                  await prisma.royaume.update({
                    where: { id: snap.id },
                    data: { pv: snap.pv }
                  });
                  await updateRoyaumeNameDiscord(client, { ...currentRoyaume, pv: snap.pv });
                  restoredCount++;
                }
              }
            }
            console.log(`✅ ${restoredCount} Royaumes ont récupéré leurs PV d'origine !`);
            // Clear snapshot
            await setConfig('purge_pv_snapshot', '[]');
            
            // Optionally, announce in a channel (hard since we don't know which one, but we can log)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur cron fin purge:', error);
    }
  });

  console.log('✅ Cron jobs initialisés');


}

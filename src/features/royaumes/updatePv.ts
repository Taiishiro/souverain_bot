import { Client } from 'discord.js';
import { prisma } from '../../db/prisma';

export async function updateRoyaumeNameDiscord(client: Client, royaumeRecord: any) {
  try {
    const salons = royaumeRecord.salons_json as any;
    let vocalId = salons?.vocal || salons?.voice || royaumeRecord.categorie_discord_id;
    
    if (!vocalId) return;

    // L'ajout récent du champ PV au schema prisma
    const channel = await client.channels.fetch(vocalId).catch(() => null);
    if (!channel || !channel.isVoiceBased()) return;

    let nom = royaumeRecord.nom;
    let pv = royaumeRecord.pv ?? 3; // default 3

    const maxPv = royaumeRecord.max_pv || 3;
    await channel.setName(`${nom} [${pv}/${maxPv} PV]`).catch((e) => console.error("Could not rename VC", e));
  } catch (error) {
    console.error("Error updating vocal name", error);
  }
}

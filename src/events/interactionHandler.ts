import { Events, ButtonInteraction, StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { buyItemWithEffectsTransaction } from '../features/economy/transactionHandlers';
import { getOrCreateUser, removeMoney, addItemToInventory, removeItemFromInventory } from '../features/economy/handlers';
import { getUserData } from '../utils/getUserData';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';
import { handleMandatUsage } from '../features/combat/mandats';
import { getNommerDragonHtml } from '../utils/nommerDragonTemplate';
import { AttachmentBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../utils/embeds';
import { healDragon, feedDragon, reviveDragon, getUserDragons } from '../features/dragons/handlers';

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: any) {
    // ---- AUTOCOMPLETE HANDLER ----
    if (interaction.isAutocomplete()) {
      try {
        const commandName = interaction.commandName;
        const currentVal = interaction.options.getFocused().toString().toLowerCase();
        
        let items = [];
        if (['acheter', 'admin-give-item', 'admin-remove-item', 'config-prix'].includes(commandName)) {
           const { prisma } = await import('../db/prisma');
           const dbItems = await prisma.shopItem.findMany();
           if (commandName === 'acheter') {
             items = dbItems.map(i => ({ name: `${i.nom} [${i.prix}💰]`, value: i.nom }));
           } else {
             items = dbItems.map(i => ({ name: i.nom, value: i.nom }));
           } 
        } else if (commandName === 'attaque') {
           const { prisma } = await import('../db/prisma');
           const targetId = interaction.options.get('cible')?.value as string;
           if (targetId) {
             const user = await prisma.user.findUnique({
               where: { discordId: targetId },
               include: { famille: { include: { membres: true } } }
             });
             let roys = await prisma.royaume.findMany({ where: { owner_id: user?.id } });
             if (roys.length === 0 && user?.famille) {
               const partner = user.famille.membres.find(m => m.discordId !== targetId);
               if (partner) roys = await prisma.royaume.findMany({ where: { owner_id: partner.id } });
             }
             items = roys.map(r => ({ name: r.nom, value: r.id }));
           }
        }

        const filtered = items.filter(choice => choice.name.toLowerCase().includes(currentVal));
        await interaction.respond(
          filtered.slice(0, 25).map(choice => ({ name: choice.name, value: choice.value }))
        );
      } catch (e) {
        console.error("Autocomplete error:", e);
      }
      return;
    }

    if (interaction.isCommand()) {
        const command = (interaction.client as any).commands?.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Il y a eu une erreur lors de l\'exécution de la commande!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Il y a eu une erreur lors de l\'exécution de la commande!', ephemeral: true });
                }
            }
        }
        return;
    }

    if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isUserSelectMenu()) {
      await handleUserSelectMenu(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    } else if (interaction.isModalSubmit()) {
      // Gérer les modales ici
      console.log(`Modale soumise: ${interaction.customId}`);
    }
  },
};

async function handleButton(interaction: ButtonInteraction) {
  const [action, ...rest] = interaction.customId.split('_');

  if (action === 'buy') {
    const param = rest.join('_');
    await handleBuyButton(interaction, param);
  } else if (action === 'use') {
    const ownerId = rest[0];
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: "❌ Cet inventaire ne vous appartient pas.", ephemeral: true });
    }
    const param = rest.slice(1).join('_');
    await handleUseItemButton(interaction, param);
  }
}

async function handleUseItemButton(interaction: ButtonInteraction, itemName: string) {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  const user = await prisma.user.findUnique({ where: { discordId: userId }, include: { famille: { include: { membres: true } } } });
  
  if (!user) return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Utilisateur introuvable.')] });
  
  const inv = user.famille_id && user.famille ? user.famille.inventaire_commun as Record<string, number> : user.inventaire as Record<string, number>;
  
  if (!inv || !inv[itemName] || inv[itemName] <= 0) {
    return interaction.editReply({ embeds: [errorEmbed('Erreur', `Vous n'avez plus de ${itemName}.`)] });
  }

  // Items qui créent direct un dragon (ex: Jeune Dragon T1)
  if (itemName.startsWith('Jeune Dragon') || itemName.startsWith('Dragon_Egg')) {
     const tiersMatch = itemName.match(/T[1-3]/);
     const tiers = tiersMatch ? tiersMatch[0] : 'T1';
     
     await removeItemFromInventory(userId, itemName, 1);
     
     await prisma.dragon.create({
        data: {
          owner_id: user.id,
          tiers: tiers,
          niveau: 1,
          puissance: tiers === 'T3' ? 60 : tiers === 'T2' ? 30 : 10,
        },
      });
      return interaction.editReply({ embeds: [successEmbed('🐉 Éclosion', `Votre ${itemName} a éclos en un Dragon ${tiers} !`)] });
  }
  
  if (itemName === 'Mandat de Perquisition' || itemName === "Mandat d'Emprisonnement") {
    const actionType = itemName === 'Mandat de Perquisition' ? 'perquisition' : 'emprisonnement';
    const row = new ActionRowBuilder<any>().addComponents(
      new (require('discord.js')).UserSelectMenuBuilder()
        .setCustomId(`select_target_${actionType}`)
        .setPlaceholder(`Qui voulez-vous cibler avec ce mandat ?`)
        .setMaxValues(1)
    );

    return interaction.editReply({
      content: `Vous vous apprêtez à utiliser un **${itemName}**.\nVeuillez sélectionner votre cible :`,
      components: [row],
      embeds: []
    });
  }

  
  if (itemName === 'Pierre de Fortification') {
    const userRoyaumes = await prisma.royaume.findMany({
      where: { owner_id: user.id }
    });
    
    // Also check partner's kingdoms if they are married
    let partnerRoyaumes = [];
    if (user.famille_id && user.famille) {
        const partner = user.famille.membres.find(m => m.id !== user.id);
        if (partner) {
           partnerRoyaumes = await prisma.royaume.findMany({
              where: { owner_id: partner.id }
           });
        }
    }
    
    const allRoyaumes = [...userRoyaumes, ...partnerRoyaumes].filter(r => r.pv < (r.max_pv || 3));
    
    if (allRoyaumes.length === 0) {
       return interaction.editReply({ embeds: [errorEmbed('Erreur', "Vous n'avez aucun royaume endommagé. Les Pierres de Fortification ne peuvent être utilisées que sur des royaumes n\'ayant pas tous leurs PV.")] });
    }
    
    const options = allRoyaumes.slice(0, 25).map(r => ({
       label: `${r.nom} (${r.type})`,
       description: `PV Actuels: ${r.pv}/3`,
       value: r.id
    }));
    
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
       .addComponents(
          new StringSelectMenuBuilder()
             .setCustomId(`applyItem_${interaction.user.id}_${itemName}`)
             .setPlaceholder('Choisissez un royaume à réparer')
             .addOptions(options)
       );
       
    return interaction.editReply({ content: `Sur quel royaume utiliser **${itemName}** ?`, components: [row as any] });
  }

  if (itemName === 'Élixir de Combat') {
    const cooldown = await prisma.cooldownPersistent.findUnique({
      where: {
        user_id_action_type: {
          user_id: userId,
          action_type: 'attack',
        }
      }
    });
    
    if (!cooldown || cooldown.available_at <= new Date()) {
      return interaction.editReply({ embeds: [errorEmbed('Inutile', `Vous n'êtes pas fatigué(e), vos créatures sont prêtes ! Vous ne pouvez pas gaspiller de l'Élixir de Combat pour rien.`)] });
    }

    await prisma.cooldownPersistent.delete({
      where: {
        user_id_action_type: {
          user_id: userId,
          action_type: 'attack',
        }
      }
    });

    await removeItemFromInventory(userId, itemName, 1);
    
    return interaction.editReply({ embeds: [successEmbed('✨ Regain de Vigueur', `Vous buvez d'un trait l'**Élixir de Combat**. La fatigue se dissipe instantanément, vos créatures sont à nouveau prêtes à attaquer !`)] });
  }

  // Si c'est un item sur dragon
  const dragonItems = ['Potion de Faim', "Potion d'Énergie", 'Potion de Puissance', "Cristal d'Expérience", 'Incubateur', 'Élixir de Restauration'];
  
  if (dragonItems.includes(itemName)) {
     const dragons = await getUserDragons(user.id);
     if (dragons.length === 0) {
        return interaction.editReply({ embeds: [errorEmbed('Erreur', "Vous n'avez aucun dragon pour utiliser cet objet.")] });
     }
     
     const options = dragons.slice(0, 25).map((d, i) => ({
        label: `Dragon ${d.tiers} (Lvl ${d.niveau}) - ${d.etat}`,
        description: `Faim: ${d.faim}/100 | En: ${d.energie_combat}/100`,
        value: d.id
     }));
     
     const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
           new StringSelectMenuBuilder()
              .setCustomId(`applyItem_${interaction.user.id}_${itemName}`)
              .setPlaceholder('Choisissez un dragon')
              .addOptions(options)
        );
        
     return interaction.editReply({ content: `Sur quel dragon utiliser **${itemName}** ?`, components: [row as any] });
  }

  return interaction.editReply({ embeds: [errorEmbed('Erreur', `L'objet **${itemName}** ne peut pas être utilisé de cette façon.`)] });
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  const [action, ...rest] = interaction.customId.split('_');

  if (action === 'applyItem') {
     const ownerId = rest[0];
     if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: "❌ Vous ne pouvez pas faire ça.", ephemeral: true });
     }
     const itemName = rest.slice(1).join('_');
     await interaction.deferReply({ ephemeral: true });
     const targetId = interaction.values[0];
     const userId = interaction.user.id;
     
     const user = await prisma.user.findUnique({ where: { discordId: userId }, include: { famille: { include: { membres: true } } } });
     if (!user) return interaction.editReply({ content: 'Erreur utilisateur.' });
     
     const inv = user.famille_id && user.famille ? user.famille.inventaire_commun as Record<string, number> : user.inventaire as Record<string, number>;
     if (!inv || !inv[itemName] || inv[itemName] <= 0) {
        return interaction.editReply({ embeds: [errorEmbed('Erreur', `Vous n'avez plus de ${itemName}.`)] });
     }
     
     if (itemName === 'Pierre de Fortification') {
        const royaume = await prisma.royaume.findUnique({ where: { id: targetId } });
        if (!royaume) return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Ce royaume n\'existe plus.')] });
        
        let isValidOwner = royaume.owner_id === user.id;
        if (!isValidOwner && user.famille_id && user.famille) {
            const partner = user.famille.membres.find(m => m.id !== user.id);
            if (partner && royaume.owner_id === partner.id) isValidOwner = true;
        }
        
        if (!isValidOwner) return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Ce royaume ne vous appartient pas (ni à votre conjoint).')] });
        
        if ((royaume.pv || 3) >= (royaume.max_pv || 3)) {
            return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Ce royaume a déjà ses PV maximums.')] });
        }
        
        const updatedRoyaume = await prisma.royaume.update({
            where: { id: targetId },
            data: { pv: (royaume.pv || 3) + 1 }
        });
        
        await removeItemFromInventory(userId, itemName, 1);
        
        // Update Discord Channel name
        const { updateRoyaumeNameDiscord } = require('../features/royaumes/updatePv');
        await updateRoyaumeNameDiscord(interaction.client, updatedRoyaume);
        
        return interaction.editReply({ embeds: [successEmbed('Royaume Fortifié', `**${royaume.nom}** a regagné 1 PV ! Il a maintenant ${updatedRoyaume.pv}/${updatedRoyaume.max_pv || 3} PV.`)] });
     }

     const dragonId = targetId;
     const dragon = await prisma.dragon.findUnique({ where: { id: dragonId } });
     if (!dragon) return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Ce dragon n\'existe plus.')] });
     
     if (dragon.owner_id !== user.id) return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Ce dragon ne vous appartient plus.')] });
     
     let successMsg = "";
     
     if (itemName === 'Potion de Faim') {
        if (dragon.etat !== 'Vivant') return interaction.editReply({ content: 'Le dragon doit être Vivant.' });
        await prisma.dragon.update({ where: { id: dragonId }, data: { faim: 100 } });
        successMsg = "Faim restaurée à 100% !";
     } else if (itemName === "Potion d'Énergie") {
        if (dragon.etat !== 'Vivant') return interaction.editReply({ content: 'Le dragon doit être Vivant.' });
        await prisma.dragon.update({ where: { id: dragonId }, data: { energie_combat: 100 } });
        successMsg = "Énergie restaurée à 100% !";
     } else if (itemName === 'Potion de Puissance') {
        if (dragon.etat !== 'Vivant') return interaction.editReply({ content: 'Le dragon doit être Vivant.' });
        await prisma.dragon.update({ where: { id: dragonId }, data: { puissance: dragon.puissance + 5 } });
        successMsg = "+5 Puissance !";
     } else if (itemName === "Cristal d'Expérience") {
        if (dragon.etat !== 'Vivant') return interaction.editReply({ content: 'Le dragon doit être Vivant.' });
        await prisma.dragon.update({ where: { id: dragonId }, data: { niveau: dragon.niveau + 1, puissance: dragon.puissance + 2 } });
        successMsg = "Niveau supérieur !";
     } else if (itemName === 'Élixir de Restauration') {
        if (dragon.etat !== 'Vivant') return interaction.editReply({ content: 'Le dragon doit être Vivant.' });
        await prisma.dragon.update({ where: { id: dragonId }, data: { faim: 100, energie_combat: 100 } });
        successMsg = "Soin complet !";
     } else if (itemName === 'Incubateur') {
        if (dragon.etat !== 'Squelette') return interaction.editReply({ content: 'Le dragon doit être un Squelette pour être réanimé.' });
        await prisma.dragon.update({ where: { id: dragonId }, data: { etat: 'Vivant', faim: 50, energie_combat: 50 } });
        successMsg = "Dragon réanimé !";
     } else {
        return interaction.editReply({ content: 'Effet inconnu.' });
     }
     
     await removeItemFromInventory(userId, itemName, 1);
     
     
    return interaction.editReply({ embeds: [successEmbed('Objet utilisé', `**${itemName}** a été utilisé sur Dragon ${dragon.tiers}.\n${successMsg}`)] });
  } else if (action === 'nameDragon') {
     const ownerId = rest[0];
     if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: "❌ Vous ne pouvez pas faire ça.", ephemeral: true });
     }
     const nouveauNom = rest.slice(1).join('_');
     await interaction.deferReply({ ephemeral: true });
     // nouveauNom already defined
     const dragonId = interaction.values[0];
     const userId = interaction.user.id;
     
     const user = await prisma.user.findUnique({ where: { discordId: userId } });
     if (!user) return interaction.editReply({ content: 'Erreur utilisateur.' });
     
     const dragon = await prisma.dragon.findUnique({ where: { id: dragonId } });
     if (!dragon) return interaction.editReply({ embeds: [errorEmbed('Erreur', "Ce dragon n'existe plus.")] });
     
     if (dragon.owner_id !== user.id) return interaction.editReply({ embeds: [errorEmbed('Erreur', 'Ce dragon ne vous appartient plus.')] });
     
     await prisma.dragon.update({
        where: { id: dragonId },
        data: { nom: nouveauNom }
     });
     
     const ancienNom = dragon.nom ? dragon.nom : `Dragon ${dragon.tiers.replace('T', '')}`;
       const html = getNommerDragonHtml({
           ancienNom: ancienNom,
           nouveauNom: nouveauNom,
           tiers: dragon.tiers
       });
       
       const imageBuffer = await renderHtmlToBuffer(html, 800, 250);
       const attachment = new AttachmentBuilder(imageBuffer, { name: 'nom_dragon.png' });
       
       return interaction.editReply({ files: [attachment] });
  }
}



async function handleBuyButton(interaction: ButtonInteraction, itemId: string) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userId = interaction.user.id;
    const kingdomNameBase = `${interaction.user.username}'s`;

    const result = await buyItemWithEffectsTransaction(userId, itemId, kingdomNameBase);

    const { getActionResultHtml } = require('../utils/actionResultTemplate');
    let description = `Vous avez obtenu <strong>${result.item.nom}</strong> !`;
    if (result.type === 'dragon') {
        description = `Vous avez acquis <strong>${result.item.nom}</strong> ! Utilisez /dragon pour le voir.`;
    } else if (result.type === 'inventaire' && result.item.type === 'royaume') {
        description = `Un acte de propriété pour <strong>${result.item.nom}</strong> a été ajouté à votre inventaire. Fondez-le avec <code>/royaume</code> !`;
    } else if (result.type === 'inventaire') {
        description = `<strong>${result.item.nom}</strong> a été ajouté à votre inventaire.`;
    }

    const html = getActionResultHtml({
      title: 'Acquisition Réussie',
      description,
      icon: '🛍️',
      colorHex: '#B8860B'
    });

    const imageBuffer = await renderHtmlToBuffer(html, 600, 250);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'achat.png' });

    await interaction.editReply({ files: [attachment] });

  } catch (error: any) {
    console.error('Erreur achat boutique:', error);
    await interaction.editReply({
      embeds: [errorEmbed('Erreur d\'Achat', error.message || 'Impossible de finaliser l\'achat.')],
    });
  }
}

async function handleUserSelectMenu(interaction) {
  const customId = interaction.customId;
  if (customId === 'select_target_perquisition') {
    await handleMandatUsage(interaction, 'perquisition');
  } else if (customId === 'select_target_emprisonnement') {
    await handleMandatUsage(interaction, 'emprisonnement');
  }
}

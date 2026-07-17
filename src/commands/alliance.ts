import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType 
} from 'discord.js';
import { prisma } from '../db/prisma';
import { getUserData } from '../utils/getUserData';
import { isFeatureEnabled } from '../utils/gameConfig';
import { errorEmbed, successEmbed } from '../utils/embeds';

// Constantes
// const CREATE_ALLIANCE_PRICE = BigInt(250000); // Remplacé par l'item "Pacte de Sang"
const COLOR_ALLIANCE = '#B8860B'; // Or Terni

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alliance')
    .setDescription('🤝 Système d\'alliances, garnisons et trésors partagés')
    
    // SOUS-COMMANDE: CRÉER
    .addSubcommand(sub => 
      sub.setName('creer')
      .setDescription('Fonder une Alliance (Requiert un "Pacte de Sang")')
      .addStringOption(opt => 
        opt.setName('nom')
        .setDescription('Le nom de l\'alliance')
        .setRequired(true)
        .setMaxLength(30)
      )
    )
    
    // SOUS-COMMANDE: INFO
    .addSubcommand(sub => 
      sub.setName('info')
      .setDescription('Afficher les informations de votre Alliance')
    )
    
    // SOUS-COMMANDE: INVITER
    .addSubcommand(sub => 
      sub.setName('inviter')
      .setDescription('Inviter un joueur dans votre Alliance')
      .addUserOption(opt => 
        opt.setName('cible')
        .setDescription('Le joueur à inviter')
        .setRequired(true)
      )
    )
    
    // SOUS-COMMANDE: DÉPÔT OR
    .addSubcommand(sub => 
      sub.setName('deposer_or')
      .setDescription('Déposer de l\'or dans le trésor de l\'alliance')
      .addIntegerOption(opt => 
        opt.setName('montant')
        .setDescription('Montant à déposer')
        .setRequired(true)
        .setMinValue(1)
      )
    )
    
    // SOUS-COMMANDE: RETRAIT OR
    .addSubcommand(sub => 
      sub.setName('retirer_or')
      .setDescription('Retirer de l\'or (Chef uniquement)')
      .addIntegerOption(opt => 
        opt.setName('montant')
        .setDescription('Montant à retirer')
        .setRequired(true)
        .setMinValue(1)
      )
    )
    
    // SOUS-COMMANDE: DÉPÔT DRAGON (Garnison)
    .addSubcommand(sub => 
      sub.setName('garnison_depot')
      .setDescription('Dépositor un dragon dans la garnison (Index du /dragons)')
      .addIntegerOption(opt => 
        opt.setName('index')
        .setDescription('Index du dragon (voir /dragon liste - commence à 1)')
        .setRequired(true)
        .setMinValue(1)
      )
    )
    
    // SOUS-COMMANDE: RETRAIT DRAGON (Garnison)
    .addSubcommand(sub => 
      sub.setName('garnison_retrait')
      .setDescription('Récupérer SON dragon de la garnison')
      .addIntegerOption(opt => 
        opt.setName('index')
        .setDescription('Index du dragon dans la garnison (de 1 à N)')
        .setRequired(true)
        .setMinValue(1)
      )
    )
    
    // SOUS-COMMANDE: QUITTER
    .addSubcommand(sub => 
      sub.setName('quitter')
      .setDescription('Quitter votre alliance actuelle')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    
    // Check global feature
    const allianceEnabled = await isFeatureEnabled('alliances');
    if (!allianceEnabled && subcommand !== 'info') { // On autorise info meme si désactivé temporairement
      return interaction.editReply({ embeds: [errorEmbed('Désactivé', '❌ Le système d\'Alliances est temporairement désactivé par ordonnance royale.')] });
    }

    const discordId = interaction.user.id;
    
    // Fetch User with full Alliance relations
    const userDb = await prisma.user.findUnique({
      where: { discordId },
      include: {
        famille: true,
        alliance: {
          include: {
            membres_users: true,
            membres_familles: true,
            dragons: true
          }
        }
      }
    });
    
    if (!userDb) {
      return interaction.editReply({ content: '❌ Impossible de récupérer les informations de ce joueur.' });
    }

    const userData = await getUserData(discordId);
    if (!userData) {
      return interaction.editReply({ content: '❌ Erreur données économiques.' });
    }

    // ──────────────────────────────────────────────
    // ⚔️ CREER ALLIANCE
    // ──────────────────────────────────────────────
    if (subcommand === 'creer') {
      if (userDb.alliance_id) {
        return interaction.editReply({ embeds: [errorEmbed('Déjà Allié', 'Vous appartenez déjà à une alliance. Quittez-la d\'abord.')] });
      }
      
      const nom = interaction.options.getString('nom', true);
      
      const existing = await prisma.alliance.findUnique({ where: { nom } });
      if (existing) {
        return interaction.editReply({ embeds: [errorEmbed('Nom Pris', 'Une alliance porte déjà ce nom.')] });
      }

      const inv = (userData.source === 'famille' || userData.source === 'alliance') && userData.famille_id 
        ? userDb.famille?.inventaire_commun as Record<string, number> 
        : userDb.inventaire as Record<string, number>;
      
      const pacteCount = inv ? inv['Pacte de Sang'] || 0 : 0;
      
      if (pacteCount <= 0) {
        return interaction.editReply({ embeds: [errorEmbed('Item Manquant', 'Vous devez acheter un **Pacte de Sang** à la boutique pour fonder une Alliance.')] });
      }

      // Paiement (retrait direct) -> Consommer l'item "Pacte de Sang"
      const newInv = { ...inv };
      newInv['Pacte de Sang'] -= 1;
      if (newInv['Pacte de Sang'] <= 0) delete newInv['Pacte de Sang'];
      
      if ((userData.source === 'famille' || userData.source === 'alliance') && userData.famille_id) {
        await prisma.famille.update({
          where: { id: userData.famille_id },
          data: { inventaire_commun: newInv }
        });
      } else {
        await prisma.user.update({
          where: { id: userDb.id },
          data: { inventaire: newInv }
        });
      }

      // Création Base de Donnée
      // Si le user a une famille, toute la famille rejoint? Non, on va lier l'User et optionnellement la famille si chef.
      // Modèle retenu: Les joueurs rejoignent individuellement en 1er lieu, plus flexible.
      // Création du Rôle Discord pour l'Alliance
      let roleId = null;
      try {
        if (interaction.guild) {
          const role = await interaction.guild.roles.create({
            name: nom,
            reason: `Création de l'Alliance ${nom}`,
            permissions: []
          });
          roleId = role.id;
          
          const member = await interaction.guild.members.fetch(discordId).catch(() => null);
          if (member) await member.roles.add(role);
        }
      } catch (err) {
        console.error("Erreur création rôle d'alliance :", err);
      }

      const newAlliance = await prisma.alliance.create({
        data: {
          nom: nom,
          chef_id: userDb.id,
          role_discord_id: roleId,
          membres_users: { connect: [{ id: userDb.id }] }
        }
      });

      // Si le user est chef de famille, on y lie aussi la famille automatiquement
      if (userDb.famille && userDb.famille.chef_id === userDb.id) {
        await prisma.famille.update({
          where: { id: userDb.famille.id },
          data: { alliance_id: newAlliance.id }
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('▬▬▬▬▬▬ 🤝 PACTE DE SANG ▬▬▬▬▬▬')
        .setDescription(`L'Alliance **${nom}** a été fondée par le Souverain <@${discordId}> grâce à un **Pacte de Sang**.\n\nQue votre règne soit long et terrifiant.`)
        .setColor(COLOR_ALLIANCE as `#{string}`);

      return interaction.editReply({ embeds: [embed] });
    }

    // A PARTIR D'ICI : ON DOIT ETRE DANS UNE ALLIANCE SAUF POUR INVITER ? Non, inviter => on doit y etre
    const alliance = userDb.alliance;
    
    if (!alliance && subcommand !== 'info') {
      return interaction.editReply({ embeds: [errorEmbed('Aucune Alliance', 'Vous n\'appartenez à aucune alliance.')] });
    }

    // ──────────────────────────────────────────────
    // ⚔️ INFO
    // ──────────────────────────────────────────────
    if (subcommand === 'info') {
      if (!alliance) {
        return interaction.editReply({ embeds: [errorEmbed('Erf', 'Vous n\'êtes dans aucune Alliance.')] });
      }
      
      const membresDb = await prisma.user.findMany({
        where: { alliance_id: alliance.id }
      });
      // Power Calculation : dragons
      let puissanceTotals = 0;
      let dragonsVivantCount = 0;
      for (const d of alliance.dragons) {
        if (d.etat === 'Vivant') {
          puissanceTotals += d.puissance;
          dragonsVivantCount++;
        }
      }

      let mentions = membresDb.map(m => `<@${m.discordId}>`).join(', ');
      if (mentions.length > 1024) mentions = mentions.substring(0, 1000) + '...';

      const isChef = alliance.chef_id === userDb.id;

      const embed = new EmbedBuilder()
        .setTitle(`▬▬▬▬▬▬ 🤝 ALLIANCE : ${alliance.nom} ▬▬▬▬▬▬`)
        .setDescription(`Le pacte unissant nos forces contre les ténèbres.\n**Chef** : <@${(await prisma.user.findUnique({where:{id:alliance.chef_id}}))?.discordId}>`)
        .addFields(
          { name: '👥 Membres', value: `${membresDb.length} - ${mentions}`, inline: false },
          { name: '💰 Trésor Commun', value: `${alliance.argent_commun} Sceaux`, inline: true },
          { name: '🐉 Garnison Active', value: `${dragonsVivantCount} dragons vivants (sur ${alliance.dragons.length} max)`, inline: true },
          { name: '⚔️ Puissance Défensive', value: `${puissanceTotals} pts`, inline: true }
        )
        .setColor(COLOR_ALLIANCE as `#{string}`);

      return interaction.editReply({ embeds: [embed] });
    }

    if (!alliance) return;

    // ──────────────────────────────────────────────
    // ⚔️ INVITER
    // ──────────────────────────────────────────────
    if (subcommand === 'inviter') {
      if (alliance.chef_id !== userDb.id) {
         return interaction.editReply({ embeds: [errorEmbed('Refusé', 'Seul le Chef de l\'alliance peut inviter.')] });
      }

      const cible = interaction.options.getUser('cible', true);
      const targetDb = await prisma.user.findUnique({ where: { discordId: cible.id }});
      
      if (!targetDb) {
        return interaction.editReply({ content: 'Le joueur cible doit créer un profil d\'abord.' });
      }
      if (targetDb.alliance_id) {
        return interaction.editReply({ embeds: [errorEmbed('Déjà affilié', 'Ce joueur est déjà dans une Alliance.')] });
      }

      // Interaction : Boutons sur le channel
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`join_alliance_${alliance.id}_${cible.id}_yes`)
            .setLabel('Accepter le Pacte')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🤝'),
          new ButtonBuilder()
            .setCustomId(`join_alliance_${alliance.id}_${cible.id}_no`)
            .setLabel('Refuser')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
        );

      await interaction.editReply({
        content: `⚔️ <@${cible.id}>, le Souverain de l'alliance **${alliance.nom}** vous offre un pacte de sang pour rejoindre leurs rangs.`,
        components: [row]
      });

      // Collector local pour la simplicité (idéalement dans un InteractionCreate, mais jouable ici pour l'UX direct)
      try {
        const msg = await interaction.fetchReply();
        const filter = (i: any) => i.user.id === cible.id && i.customId.startsWith(`join_alliance_${alliance.id}`);
        // Wait 2 mins max
        const collected = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 120000 });
        
        if (collected.customId.endsWith('_yes')) {
          await prisma.user.update({
            where: { id: targetDb.id },
            data: { alliance_id: alliance.id }
          });
          
          // Assigner le rôle Discord si existant
          if (alliance.role_discord_id && interaction.guild) {
            try {
              const member = await interaction.guild.members.fetch(cible.id).catch(() => null);
              if (member) await member.roles.add(alliance.role_discord_id);
            } catch (err) { console.error("Could not assign alliance role"); }
          }
          
          if (targetDb.famille_id) {
            // Update the family too if target is the chef? 
            // Optional: User joined, so let's bind their family if they are the chef.
            const fam = await prisma.famille.findUnique({where: {id: targetDb.famille_id}});
            if (fam?.chef_id === targetDb.id) {
              await prisma.famille.update({ where: {id: fam.id}, data: {alliance_id: alliance.id}});
            }
          }

          await collected.update({
            content: `🤝 <@${cible.id}> a signé le pacte ! Bienvenue dans l'Alliance **${alliance.nom}**.`,
            components: []
          });
        } else {
          await collected.update({
            content: `❌ <@${cible.id}> a refusé l'invitation.`,
            components: []
          });
        }
      } catch (err) {
        await interaction.editReply({ content: '⏳ L\'invitation a expirée.', components: [] });
      }
      return;
    }

    // ──────────────────────────────────────────────
    // ⚔️ DEPOSER OR
    // ──────────────────────────────────────────────
    if (subcommand === 'deposer_or') {
      const montant = BigInt(interaction.options.getInteger('montant', true));
      
      if (userData.argent < montant) {
        return interaction.editReply({ embeds: [errorEmbed('Fonds', 'Vous n\'avez pas assez d\'or.')] });
      }

      if (userData.source === 'famille' && userData.famille_id) {
        await prisma.famille.update({ where: { id: userData.famille_id }, data: { argent_commun: { decrement: montant } } });
      } else {
        await prisma.user.update({ where: { id: userDb.id }, data: { argent_perso: { decrement: montant } } });
      }

      await prisma.alliance.update({
        where: { id: alliance.id },
        data: { argent_commun: { increment: montant } }
      });

      return interaction.editReply({ embeds: [successEmbed('Dépôt Réussi', `Vous avez transféré ${montant}💰 dans le Trésor de l'Alliance.`)] });
    }

    // ──────────────────────────────────────────────
    // ⚔️ RETIRER OR
    // ──────────────────────────────────────────────
    if (subcommand === 'retirer_or') {
      if (alliance.chef_id !== userDb.id) {
        return interaction.editReply({ embeds: [errorEmbed('Droits', 'Seul le Chef de l\'alliance peut retirer l\'or du trésor afin de le redistribuer.')] });
      }

      const montant = BigInt(interaction.options.getInteger('montant', true));

      if (BigInt(alliance.argent_commun) < montant) {
        return interaction.editReply({ embeds: [errorEmbed('Or Insuffisant', `Le trésor ( ${alliance.argent_commun}💰 ) n'a pas les fonds demandés.`)] });
      }

      await prisma.alliance.update({
        where: { id: alliance.id },
        data: { argent_commun: { decrement: montant } }
      });

      if (userData.source === 'famille' && userData.famille_id) {
        await prisma.famille.update({ where: { id: userData.famille_id }, data: { argent_commun: { increment: montant } } });
      } else {
        await prisma.user.update({ where: { id: userDb.id }, data: { argent_perso: { increment: montant } } });
      }

      return interaction.editReply({ embeds: [successEmbed('Retrait Réussi', `Vous avez récupéré ${montant}💰 du Trésor de l'Alliance.`)] });
    }

    // ──────────────────────────────────────────────
    // ⚔️ GARNISON DEPOT
    // ──────────────────────────────────────────────
    if (subcommand === 'garnison_depot') {
      const index = interaction.options.getInteger('index', true);
      
      // Liste de ses dragons personnels (non-dépôsés)
      const userDragons = await prisma.dragon.findMany({
        where: { owner_id: userDb.id, alliance_id: null },
        orderBy: { tiers: 'desc' },
      });

      if (index < 1 || index > userDragons.length) {
         return interaction.editReply({ embeds: [errorEmbed('Index Invalide', `Index incorrect. Vous avez ${userDragons.length} dragon(s) disponibles au dépôt (voir /dragons).`)] });
      }

      const targetDragon = userDragons[index - 1];
      
      if (targetDragon.etat === 'Squelette' || targetDragon.etat === 'Incinéré') {
        return interaction.editReply({ embeds: [errorEmbed('Invalide', 'Seuls les dragons VIVANTS peuvent protéger la garnison.')] });
      }

      await prisma.dragon.update({
        where: { id: targetDragon.id },
        data: { alliance_id: alliance.id }
      });

      return interaction.editReply({ embeds: [successEmbed('Garnison Déployée', `Votre dragon **${targetDragon.nom || `T${targetDragon.tiers.replace('T', '')}`}** a été posté dans la garnison de l'Alliance !`)] });
    }

    // ──────────────────────────────────────────────
    // ⚔️ GARNISON RETRAIT
    // ──────────────────────────────────────────────
    if (subcommand === 'garnison_retrait') {
      const index = interaction.options.getInteger('index', true);
      
      // Liste des dragons en garnison
      const garDragons = await prisma.dragon.findMany({
        where: { alliance_id: alliance.id },
        orderBy: { date_creation: 'asc' }, // simple asc order pour la garnison
      });

      if (index < 1 || index > garDragons.length) {
         return interaction.editReply({ embeds: [errorEmbed('Index Invalide', `Index incorrect dans la garnison (Max: ${garDragons.length}).`)] });
      }

      const targetDragon = garDragons[index - 1];

      // LA REGLE D'OR DU CAHIER DES CHARGES:
      // "seul le proprio de base du dragon peut retirer"
      if (targetDragon.owner_id !== userDb.id) {
         return interaction.editReply({ embeds: [errorEmbed('Interdit', `Vous n'êtes pas le propriétaire d'origine de ce dragon ! Seul <@${(await prisma.user.findUnique({where:{id:targetDragon.owner_id}}))?.discordId}> a ce droit.`)] });
      }

      await prisma.dragon.update({
        where: { id: targetDragon.id },
        data: { alliance_id: null }
      });

      return interaction.editReply({ embeds: [successEmbed('Retrait Autorisé', `Vous reprenez possession immédiate de votre dragon **${targetDragon.nom || `T${targetDragon.tiers.replace('T', '')}`}**.`)] });
    }

    // ──────────────────────────────────────────────
    // ⚔️ QUITTER
    // ──────────────────────────────────────────────
    if (subcommand === 'quitter') {
       if (alliance.chef_id === userDb.id) {
         return interaction.editReply({ embeds: [errorEmbed('Impossible', 'Le Chef ne peut pas fuir. Vous devez utiliser une commande de dissolution si vous restez le seul (Non Implémenté encore pour la V1), ou transférer.')] });
       }

       // Auto-retirer ses dragons de la garnison (ils ne peuvent/doivent pas rester s'ils quittent ?)
       // Ou on les abandonne ? "Je ne peux interagir avec la garnison sans y être". 
       // Pour éviter des bugs de dragons "bloqués", on les rends au moment de quitter.
       await prisma.dragon.updateMany({
         where: { owner_id: userDb.id, alliance_id: alliance.id },
         data: { alliance_id: null }
       });

       await prisma.user.update({
         where: { id: userDb.id },
         data: { alliance_id: null }
       });
       
       // Retirer le rôle Discord de l'alliance si on quitte
       if (alliance.role_discord_id && interaction.guild) {
         try {
           const member = await interaction.guild.members.fetch(discordId).catch(() => null);
           if (member) await member.roles.remove(alliance.role_discord_id);
         } catch(err) { console.error("Could not remove alliance role"); }
       }
       
       if (userDb.famille && userDb.famille.chef_id === userDb.id) {
          await prisma.famille.update({
            where: { id: userDb.famille.id },
            data: { alliance_id: null }
          });
       }

       return interaction.editReply({ embeds: [successEmbed('Pacte Brisé', `Vous avez quitté l'Alliance. Vos dragons en garnison vous ont suivi.`)] });
    }
  }
};

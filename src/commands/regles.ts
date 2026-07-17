import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regles')
    .setDescription('📜 Affiche de manière détaillée toutes les lois et mécaniques de Souverain'),

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const embedIntro = new EmbedBuilder()
      .setTitle(`${EMOJIS.SCROLL} LES LOIS INÉBRANLABLES DE SOUVERAIN`)
      .setColor(COLORS.INFO)
      .setDescription(`Bienvenue, âme téméraire. Voici le Grimoire des Lois de ce monde impitoyable.\nL'ignorance n'est pas une excuse face au Jugement.\n\nCe monde est régi par le sang, l'or et la conquête. Lisez attentivement chaque point sous peine de tout perdre.\n\n${SEPARATORS.BREAK}`)
      .setThumbnail(interaction.client.user?.displayAvatarURL() || null);

    const embedEco = new EmbedBuilder()
      .setTitle(`${EMOJIS.COINS} 1. L'ÉCONOMIE ET L'ÉCHOPPE`)
      .setColor(COLORS.ROYALTY)
      .addFields(
        { 
          name: `${SEPARATORS.SUBTITLE('Obole Quotidienne')}`, 
          value: `${EMOJIS.LIST} Utilisez \`/daily\` pour recevoir votre Obole Quotidienne.\n${EMOJIS.LIST} Ce montant augmente selon vos possessions (Royaumes, Famille).` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('L\'Échoppe de l\'Alchimiste')}`, 
          value: `${EMOJIS.LIST} Utilisez \`/boutique\` pour acheter des Artefacts cruciaux (Élixirs, Armes, Boucliers) et des Créatures.\n${EMOJIS.LIST} Les informations financières complexes vous seront transmises sous forme d'imprimés officiels (Images).` 
        }
      );

    const embedFamille = new EmbedBuilder()
      .setTitle(`${EMOJIS.MARRIAGE} 2. LES UNIONS ET LEURS CENDRES`)
      .setColor(COLORS.ROYALTY)
      .addFields(
        { 
          name: `${SEPARATORS.SUBTITLE('L\'Union Centrale')}`, 
          value: `${EMOJIS.LIST} Le mariage (\`/marier\`) est une FUSION TOTALE.\n${EMOJIS.LIST} Vos comptes en banque personnels sont vidés et fusionnés en un seul grand coffre : l'\`argent_commun\`. Vous partagez tout avec votre Conjoint.` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('La Ruine (Le Divorce)')}`, 
          value: `${EMOJIS.LIST} Le divorce (\`/divorce\`) est une punition absolue. Ce n'est pas du 50/50.\n${EMOJIS.LIST} **50% de toute votre fortune commune est INCINÉRÉE par le ${EMOJIS.FIRE} Feu Royal (effacée à jamais)**, puis seulement le reste est divisé entre vous deux.` 
        }
      );

    const embedDragons = new EmbedBuilder()
      .setTitle(`${EMOJIS.DRAGON_ALIVE} 3. LE CYCLE DES CRÉATURES`)
      .setColor(COLORS.INFO)
      .addFields(
        { 
          name: `${SEPARATORS.SUBTITLE('La Ménagerie')}`, 
          value: `${EMOJIS.LIST} Les Dragons naissent au Tiers 1. Ils doivent être nourris régulièrement avec de la Viande de Bête Sauvage, sinon ils refuseront de combattre.` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('Squelettes et Cadavres')}`, 
          value: `${EMOJIS.LIST} Un dragon terrassé ne disparaît pas. Il devient un **Squelette inerte** (${EMOJIS.DRAGON_SKELETON}).\n${EMOJIS.LIST} Ses statistiques sont gelées et il occupe une place inutilement.` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('La Résurrection')}`, 
          value: `${EMOJIS.LIST} Pour ramener un Squelette à la vie, vous devez acquérir un **${EMOJIS.MAGIC} Incubateur** depuis la boutique. Seul cet artéfact sacré lui rendra son souffle.` 
        }
      );

    const embedGuerre = new EmbedBuilder()
      .setTitle(`${EMOJIS.SWORD} 4. L'ART DU CARNAGE ET DU SIÈGE`)
      .setColor(COLORS.DANGER)
      .addFields(
        { 
          name: `${SEPARATORS.SUBTITLE('Mode: Pillage')}`, 
          value: `${EMOJIS.LIST} But : Voler l'or adverse. Vous lancez un assaut brutal sur la trésorerie de votre ennemi.\n${EMOJIS.LIST} Dégâts et pertes maximales des deux côtés, mais l'or pillé est garanti.` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('Mode: Siège')}`, 
          value: `${EMOJIS.LIST} But : Vous emparer du Royaume ennemi (\`/attaque [Mode Siège]\`).\n${EMOJIS.LIST} Vous gagnez beaucoup moins d'or (10%), et le défenseur bénéficie de +20% de bonus terrain.\n${EMOJIS.LIST} Avantage : Si vous gagnez, vous arrachez 1 PV à la forteresse. À 0 PV, **le Royaume devient le vôtre.**` 
        }
      );

    const embedRoyaume = new EmbedBuilder()
      .setTitle(`${EMOJIS.CASTLE} 5. LA FONDATION D'EMPIRES`)
      .setColor(COLORS.ROYALTY)
      .addFields(
        { 
          name: `${SEPARATORS.SUBTITLE('Acquérir un Royaume')}`, 
          value: `${EMOJIS.LIST} Posséder un Royaume (\`/royaume\`) génère des rentes passives, augmente la force de l'armée, et vous concède des titres nobles comme **Souverain**.` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('Les Murs et les Voix')}`, 
          value: `${EMOJIS.LIST} Vos Royaumes se matérialisent sur le serveur Discord, avec leurs salons exclusifs.\n${EMOJIS.LIST} Leurs Points de Vie (3 par défaut) sont visibles **directement dans les noms des salons vocaux**.\n${EMOJIS.LIST} Réparez-les avec une **Pierre de Fortification** (Boutique > Inventaire).` 
        },
        { 
          name: `${SEPARATORS.SUBTITLE('Le Châtiment Suprême')}`, 
          value: `${EMOJIS.LIST} La commande \`/emprisonner\` nécessite un **Mandat d'Emprisonnement**. La cible est jetée dans les sombres ${EMOJIS.PRISON} cachots de votre Royaume.\n${EMOJIS.LIST} Le prisonnier perd l'accès à **tout le serveur Discord**, sauf au texte restreint de son cachot jusqu'à l'expiration du mandat.` 
        }
      )
      .setFooter({ text: 'Souverain Bot - Ignorantia juris non excusat', iconURL: interaction.client.user?.displayAvatarURL() });

    await interaction.reply({ embeds: [embedIntro, embedEco, embedFamille, embedDragons, embedGuerre, embedRoyaume], ephemeral: true });
  },
};

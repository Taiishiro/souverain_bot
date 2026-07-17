import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Client, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser } from '../features/economy/handlers';
import { getAliveDragonsForUser } from '../features/dragons/handlers';
import { getUserTotalPower } from '../features/economy/handlers';
import { isFeatureEnabled } from '../utils/gameConfig';
import { errorEmbed, royaumeCreatedEmbed } from '../utils/embeds';
import { COLORS, EMOJIS, SEPARATORS } from '../utils/colors';
import {
  createSouverainRole,
  createRoyaumeVocal,
} from '../features/royaumes/discordSetup';
import { getRoyaumeCardHtml } from '../utils/royaumeCardTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

const ROYAUME_PRICE = BigInt(50000); // 50k Oboles
const DRAGONS_REQUIRED = 3; // T2+ dragons requis

module.exports = {
  data: new SlashCommandBuilder()
    .setName('royaume')
    .setDescription('👑 Fonde un Royaume ou consulte ses infos')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('frontalier')
        .setDescription('Fonde un Royaume Frontalier (Nécessite l\'item dans l\'inventaire)')
        .addStringOption((option) =>
          option
            .setName('nom')
            .setDescription('Nom du Royaume')
            .setRequired(true)
            .setMaxLength(40)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('principal')
        .setDescription('Fonde un Royaume Principal (Nécessite l\'item dans l\'inventaire)')
        .addStringOption((option) =>
          option
            .setName('nom')
            .setDescription('Nom du Royaume')
            .setRequired(true)
            .setMaxLength(40)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('info')
        .setDescription('Affiche les infos de votre Royaume')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Vérifier si les royaumes sont activés
      const royaumesEnabled = await isFeatureEnabled('royaumes');
      if (!royaumesEnabled) {
        return await interaction.editReply({
          embeds: [errorEmbed('Fonctionnalité désactivée', 'Système de royaumes désactivé.')],
        });
      }

      const userId = interaction.user.id;
      await getOrCreateUser(userId);

      const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: { famille: true }
      });

      if (!user) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      const subcommand = interaction.options.getSubcommand();
      const client = interaction.client as Client;

      if (subcommand === 'frontalier' || subcommand === 'principal') {
        const typeRoyaume = subcommand === 'frontalier' ? 'Frontalier' : 'Principal';
        const itemNom = 'Royaume ' + typeRoyaume;

        // Vérifier l'inventaire
        const inv = (user.famille_id && user.famille ? user.famille.inventaire_commun : user.inventaire) as Record<string, number> || {};
        if (!inv[itemNom] || inv[itemNom] <= 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(COLORS.DANGER)
                .setTitle(`${EMOJIS.ERROR} OBJET MANQUANT`)
                .setDescription(
                  `${SEPARATORS.SECTION}\n` +
                  `Vous devez posséder un **${itemNom}** dans votre inventaire pour fonder ce type de royaume.\n` +
                  `Allez l'acheter dans la **/boutique**.\n` +
                  `${SEPARATORS.SECTION}`
                ),
            ],
          });
        }

        const nom = interaction.options.getString('nom', true);

        // Vérifier que le nom n'est pas déjà pris
        const nameExists = await prisma.royaume.findUnique({
          where: { nom: nom }
        });

        if (nameExists) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(COLORS.DANGER)
                .setTitle(`${EMOJIS.ERROR} NOM INDISPONIBLE`)
                .setDescription(
                  `${SEPARATORS.SECTION}\n` +
                  `Le royaume **${nom}** existe déjà dans ce monde.\n` +
                  `Veuillez choisir un autre nom.\n` +
                  `${SEPARATORS.SECTION}`
                ),
            ],
          });
        }

        // Débiter l'item
        const newInv = { ...inv };
        newInv[itemNom] -= 1;
        if (newInv[itemNom] <= 0) delete newInv[itemNom];

        if (user.famille_id && user.famille) {
          await prisma.famille.update({
            where: { id: user.famille_id },
            data: { inventaire_commun: newInv },
          });
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { inventaire: newInv },
          });
        }

        try {
          // Créer le rôle Souverain
          const roleId = await createSouverainRole(client, interaction.guildId!, nom, userId);

          // Créer le Salon Vocal
          const pseudo = interaction.user.username;
          const vocalId = await createRoyaumeVocal(client, interaction.guildId!, nom, pseudo, roleId, typeRoyaume);

          // Créer le record Royaume en BD
          const royaume = await prisma.royaume.create({
            data: {
              nom,
              owner_id: user.id,
              puissance: BigInt(100),
              pv: typeRoyaume === 'Principal' ? 5 : 3,
              max_pv: typeRoyaume === 'Principal' ? 5 : 3,
              type: typeRoyaume,
              categorie_discord_id: vocalId, // On fallback l'ID catégorie sur le salon vocal unique
              role_discord_id: roleId,
              salons_json: {
                vocal: vocalId
              },
            },
          });

          // Afficher le succès
          const embed = royaumeCreatedEmbed(
            nom,
            interaction.user.username,
            BigInt(0), // Le prix est désuet
            vocalId,
            itemNom
          );

          await interaction.editReply({ embeds: [embed] });
        } catch (discordError) {
          console.error('Discord API Error:', discordError);
          // Remettre l'item en cas d'erreur
          if (user.famille_id && user.famille) {
              await prisma.famille.update({
                  where: { id: user.famille_id },
                  data: { inventaire_commun: inv },
              });
          } else {
              await prisma.user.update({
                  where: { id: user.id },
                  data: { inventaire: inv },
              });
          }
          return await interaction.editReply({
            embeds: [errorEmbed('Erreur Discord', 'Impossible de créer l\'infrastructure Discord.')],
          });
        }
      } else if (subcommand === 'info') {
        const royaumes = await prisma.royaume.findMany({
          where: { owner_id: user.id },
        });

        if (royaumes.length === 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(COLORS.INFO)
                .setTitle(`${EMOJIS.CROWN} SANS ROYAUME`)
                .setDescription(
                  `${SEPARATORS.SECTION}\n` +
                  `Vous ne possédez pas de Royaume.\n\n` +
                  `${EMOJIS.LIST} Fondez-en un avec /royaume acheter\n` +
                  `${SEPARATORS.SECTION}`
                ),
            ],
          });
        }

        // Calcul puissance totale (dragons vivants + puînés)
        const puissanceTotale = await getUserTotalPower(user.id);
        let avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });
        if (!avatarUrl) {
            avatarUrl = interaction.user.defaultAvatarURL;
        }
        
        const royaumeAffichage = royaumes.length === 1 ? royaumes[0].nom : `${royaumes.length} Royaumes`;
        const html = getRoyaumeCardHtml({
            royaumeNom: royaumeAffichage,
            souverainName: interaction.user.username,
            puissance: puissanceTotale.toString(),
            avatarUrl
        });
        
        const imageBuffer = await renderHtmlToBuffer(html, 1200, 400);
        const attachment = new AttachmentBuilder(Buffer.from(imageBuffer), { name: 'royaume.png' });

        await interaction.editReply({ files: [attachment] });
      }
    } catch (error) {
      console.error('Erreur /royaume:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Impossible de traiter la commande.')],
      });
    }
  },
};
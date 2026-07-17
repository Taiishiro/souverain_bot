import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getOrCreateUser, addMoney } from '../features/economy/handlers';
import { getUserData } from '../utils/getUserData';
import { hasCooldown, setCooldown } from '../utils/cooldown';
import { successEmbed, errorEmbed } from '../utils/embeds';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🎁 Obtenez votre argent de départ (une seule fois)'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;

      // Créer l'user s'il n'existe pas
      await getOrCreateUser(userId);

      // Vérifier si déjà utilisé
      if (await hasCooldown(userId, 'setup')) {
        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Setup déjà effectué',
              'Vous avez déjà reçu votre argent de départ !'
            ),
          ],
        });
      }

      // Récupérer les données actuelles
      const userData = await getUserData(userId);
      if (!userData) {
        return await interaction.editReply({
          content: '❌ Impossible de récupérer les informations de ce joueur.', embeds: [],
        });
      }

      // Vérifier si l'utilisateur a déjà de l'argent
      if (userData.argent > BigInt(0)) {
        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Setup non disponible',
              'Vous avez déjà de l\'argent dans votre compte !'
            ),
          ],
        });
      }

      // Donner 1000$ de départ
      const success = await addMoney(userId, BigInt(1000));

      if (!success) {
        return await interaction.editReply({
          embeds: [errorEmbed('Erreur', 'Impossible d\'ajouter l\'argent de départ.')],
        });
      }

      // Marquer comme utilisé (cooldown permanent)
      await setCooldown(userId, 'setup', 365 * 24 * 60 * 60 * 1000); // 1 an

      await interaction.editReply({
        embeds: [
          successEmbed(
            '🎉 Rite d\'Initiation Réussi !',
            `Vous avez reçu **1000🪙** pour votre entrée dans l'**Âge des Rois Numériques** !\n\n\`🔮\` Utilisez \`/boutique\` pour découvrir les merveilles technomagiques disponibles.`
          ),
        ],
      });

    } catch (error) {
      console.error('Erreur commande setup:', error);
      await interaction.editReply({
        embeds: [errorEmbed('Erreur', 'Une erreur est survenue.')],
      });
    }
  },
};
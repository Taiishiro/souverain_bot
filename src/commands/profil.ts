import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { prisma } from '../db/prisma';
import { getOrCreateUser, getUserWealthRank } from '../features/economy/handlers';
import { getUserData } from '../utils/getUserData';
import { getProfileHtml } from '../utils/profileTemplate';
import { renderHtmlToBuffer } from '../utils/puppeteerClient';

export const data = new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Affiche votre profil avec vos informations de richesse et de rang.')
    .addUserOption(option => 
        option.setName('joueur')
            .setDescription('Voir le profil d\'un autre joueur')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('joueur') || interaction.user;
    
    try {
        await getOrCreateUser(targetUser.id);
        const userData = await getUserData(targetUser.id);
        const userDbData = await prisma.user.findUnique({
            where: { id: targetUser.id },
            include: { famille: true }
        });

        if (!userData || !userDbData) {
            await interaction.editReply('❌ Impossible de récupérer les informations de ce joueur.');
            return;
        }

        const isFamille = !!userDbData.famille;
        const wealthRank = await getUserWealthRank(targetUser.id, isFamille);
        const dragonCount = await prisma.dragon.count({
            where: { owner_id: targetUser.id }
        });

        let avatarUrl = targetUser.displayAvatarURL({ extension: 'png', forceStatic: true, size: 256 });
        if (!avatarUrl) {
            avatarUrl = targetUser.defaultAvatarURL;
        }

        const familyName = userDbData.famille ? userDbData.famille.nom : 'Sans famille';
        const rawGold = Number(userData.argent);

        const htmlContent = getProfileHtml({
            username: targetUser.username,
            family: familyName,
            gold: Math.floor(rawGold).toLocaleString('fr-FR'),
            dragons: dragonCount.toString(),
            rank: `#${wealthRank}`,
            avatarUrl: avatarUrl,
            dragonIconUrl: 'https://i.imgur.com/kP4k6c4.png' // generic dragon icon
        });

        const imageBuffer = await renderHtmlToBuffer(htmlContent, 1200, 450);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'profil.png' });

        await interaction.editReply({ files: [attachment] });
    } catch (error) {
        console.error('Error generating profile image:', error);
        await interaction.editReply('❌ Une erreur est survenue lors de la génération de votre profil.');
    }
}

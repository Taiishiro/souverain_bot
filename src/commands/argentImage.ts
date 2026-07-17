import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import nodeHtmlToImage from 'node-html-to-image';

const htmlTemplate = (gold: string) => `
<!DOCTYPE html>
<html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\">
  <link href=\"https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Roboto:wght@400;700&display=swap\" rel=\"stylesheet\">
  <style>
    body { margin: 0; padding: 0; }
    .cartouche {
      width: 350px;
      height: 100px;
      background-color: #2F2F2F;
      border: 3px solid #B8860B;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 10px;
      box-shadow: 5px 5px 15px rgba(0,0,0,0.7);
    }
    .title {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      color: #B8860B;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .value {
      font-family: 'Roboto', sans-serif;
      font-size: 32px;
      font-weight: bold;
      color: #B8860B;
    }
  </style>
</head>
<body>
  <div class=\"cartouche\">
    <div class=\"title\">Trésor Royal</div>
    <div class=\"value\">${gold} 💰</div>
  </div>
</body>
</html>
`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('argentimg')
    .setDescription('Affiche ta fortune royale sous forme de cartouche image.'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    // Ici, remplace par la vraie récupération de l'or du joueur
    const gold = '12,500'; // À remplacer par la vraie valeur
    const html = htmlTemplate(gold);
    const imageBuffer = await nodeHtmlToImage({
      html,
      quality: 100,
      type: 'png',
      encoding: 'binary',
      puppeteerArgs: { 
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--use-gl=egl',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--no-zygote'
        ] 
      },
    }) as Buffer;
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'tresor.png' });
    await interaction.editReply({ files: [attachment] });
  },
};

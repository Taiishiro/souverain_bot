import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { prisma } from './db/prisma';
import { initializeCronJobs } from './cronjobs';
import { initializeGameConfig } from './utils/initConfig';
import path from 'path';
import fs from 'fs';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Commandes collection
export const commands = new Collection();

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath).default || require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  console.log(`✅ Événement chargé: ${event.name}`);
}

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
  .filter((file) => 
    (file.endsWith('.js') || file.endsWith('.ts')) && 
    !file.endsWith('.d.ts') &&
    !file.endsWith('.swp') && 
    !file.endsWith('.bak') && 
    !file.endsWith('.backup') &&
    !file.includes('Example') && 
    !file.includes('example')
  );

const command_data = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default || require(filePath);
  
  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
    command_data.push(command.data.toJSON());
    console.log(`✅ Commande chargée: ${command.data.name}`);
  } else {
    console.warn(`⚠️  Commande invalide à ${filePath}: pas de data/execute`);
  }
}

// Enregistrer les slash commands si en dev
if (process.env.DISCORD_SERVER_ID) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');
  
  (async () => {
    try {
      console.log(`🔄 Enregistrement des commandes pour le serveur ${process.env.DISCORD_SERVER_ID}...`);
      
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID || '',
          process.env.DISCORD_SERVER_ID || ''
        ),
        { body: command_data }
      );
      
      console.log(`✅ ${command_data.length} commandes enregistrées!`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des commandes:', error);
    }
  })();
}

client.once('ready', async () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
  console.log(`✅ ${commands.size} commandes disponibles`);
  console.log(`${'='.repeat(50)}\n`);

  // Initialiser les configurations du jeu
  await initializeGameConfig();

  // Initialiser les cron jobs
  initializeCronJobs(client);
});

client.on('interactionCreate', async (interaction) => {
  console.log("ANY INTERACTION REÇUE :", interaction.type);
  
  if (interaction.isAutocomplete()) {
    try {
      const commandName = interaction.commandName;
      const currentVal = interaction.options.getFocused().toString().toLowerCase();
      
      let items = [];
      if (['acheter', 'admin-give-item', 'admin-remove-item', 'config-prix'].includes(commandName)) {
         const { prisma } = await import('./db/prisma');
         const dbItems = await prisma.shopItem.findMany();
         
         items = dbItems.map(i => {
           const p = Number(i.prix);
           let pStr = p >= 1000000 ? `${(p/1000000).toFixed(1).replace('.0', '')}M` : p >= 1000 ? `${Math.floor(p/1000)}k` : `${p}`;
           return {
             name: commandName === 'acheter' ? `${i.nom} [${pStr}]` : i.nom,
             value: i.nom
           };
         });
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

  if (!interaction.isChatInputCommand()) return;
  console.log("💬 Commande reçue :", interaction.commandName);

  const command: any = commands.get(interaction.commandName);
  if (!command) {
    console.warn(`⚠️  Commande inconnue: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error('Erreur commande:', error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ Erreur lors de l\'exécution de la commande.',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '❌ Erreur lors de l\'exécution de la commande.',
        ephemeral: true,
      });
    }
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du bot...');
  await prisma.$disconnect();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);

export { client, prisma };

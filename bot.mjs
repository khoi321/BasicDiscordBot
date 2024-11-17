//learn more at readme
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addServer } from './config/google-sheets.js';
import { handleNsfwInteraction } from './commands/nsfw/nsfw.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
});
const joinChannelId='1307519597749993522';  // replace with your channel ID ,bot join (see more in readme)
const leaveChannelId='1307519631862272132'; // replace with your channel ID ,bot leave (see more in readme)
client.commands = new Map();

async function loadCommands(dir) {
  const commandFiles = fs.readdirSync(path.join(__dirname, dir)).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = await import(`./${dir}/${file}`);
    if (!command.default || !command.default.name) {
      console.error(`Command file ${file} does not export a valid command object.`);
      continue;
    }
    client.commands.set(command.default.name, command.default);
  }
}

async function main() {
  await loadCommands('commands');
  await loadCommands('commands/nsfw');
  await loadCommands('commands/image');
  await loadCommands('commands/utility');
  await loadCommands('commands/economy');
  await loadCommands('commands/game');
  await loadCommands('commands/moderation');
  client.once('ready',()=>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
        status:'idle',   //replace idle with your desired status example: online, dnd, idle,invisible
        activities:[{name:'!help',type:'PLAYING'}] //replace this with your desired activity example: ['name','type'] type can be PLAYING, WATCHING, LISTENING, COMPETING
    });
});

  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error('Error executing command:', error);
      await message.reply('There was an error executing that command.');
    }
  });

  client.on('interactionCreate', async interaction => {
    console.log('Received interaction:', interaction); 
  
    if (!interaction.isCommand()) return;
  
    const command = client.commands.get(interaction.commandName);
    console.log('Command:', command); 
  
    if (!command) {
      console.error('Command không tồn tại:', interaction.commandName);
      return await interaction.reply({
        content: 'Lệnh không hợp lệ.',
        ephemeral: true,
      });
    }
  
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing interaction command:', error);
      await interaction.reply({
        content: 'Có lỗi xảy ra khi thực thi lệnh: ' + error.message,
        ephemeral: true,
      });
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (interaction.customId === 'nsfw-on' || interaction.customId === 'nsfw-off') {
      await handleNsfwInteraction(interaction);
    }
  });

  client.on('guildCreate',guild=>{
    const channel=client.channels.cache.get(joinChannelId);
    if(channel){
        channel.send(`Bot vừa được thêm vào server **${guild.name}** (ID:\`${guild.id}\`).Server hiện tại bot đang ở \`${client.guilds.cache.size}\``);
    }
});
  client.on('guildDelete',guild=>{
    const channel=client.channels.cache.get(leaveChannelId);
    if(channel){
        channel.send(`Bot vừa rời khỏi server *${guild.name}* (ID:\`${guild.id}\`).Server hiện tại bot đang ở \`${client.guilds.cache.size}\``);
    }
});


client.login('YOUR_BOT_TOKEN'); /replace YOUR_BOT_TOKEN to ur real token
main().catch(console.error);

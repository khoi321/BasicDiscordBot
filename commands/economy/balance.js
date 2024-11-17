import { getUserBalance, checkUserExists } from '../../config/google-sheets-economy.js';

export default {
  name: 'balance',
  description: 'Check your current balance.',
  async execute(message) {
    const userId = message.author.id;
    const userName = message.author.username;

    const userExists = await checkUserExists(userId);

    if (!userExists) {
      return message.reply(`**${userName}**, you are not registered. Please use the \`!play\` command to get started.`);
    }

    const balance = await getUserBalance(userId);
    
    await message.reply(`**${userName}**, your current balance is **${balance}**<:coin:1294299661368037458>!`);
  },
};

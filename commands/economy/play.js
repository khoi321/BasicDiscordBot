import { EmbedBuilder } from 'discord.js';
import { addUserToSheet, checkUserExists } from '../../config/google-sheets-economy.js';

export default {
  name: 'play',
  description: 'Start playing and accept terms.',
  async execute(message) {
    const userId = message.author.id;

    const userExists = await checkUserExists(userId);
    if (userExists) {
      return message.reply("You have already registered and cannot use this command again.");
    }

    const embed = new EmbedBuilder()
      .setColor("#00b0f4")
      .setTitle("🔒 Accept to Continue")
      .setDescription(
        "**📜 Terms and Conditions:**\n" +
        "**1. Cryptocurrency**: This is virtual currency, not real money. It has no value outside the platform.\n" +
        "**2. No Exchange**: It is forbidden to exchange the bot's cryptocurrency for real money or real items.\n" +
        "**3. Disclaimer**: We are not responsible for any losses caused by using this bot.\n" +
        "**4. Compliance with Rules**: Users must adhere to Discord rules and the bot's terms.\n" +
        "**5. Account Security**: Users are responsible for the security of their accounts.\n" +
        "**6. Changes to Rules**: Rules are subject to change without notice.\n\n" +
        "[🔐 Privacy Policy](https://example.com) - [📜 Terms of Service](https://example.com)"
      )
      .setFooter({ text: "Thank you for understanding", iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const msg = await message.reply({ embeds: [embed] });
    await msg.react('✅');
    await msg.react('❌');

    const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === '✅') {
        await message.reply('✅ Accept Success!');
        await addUserToSheet(message.author.id, message.author.username);
      } else {
        await message.reply('❌ Accept Denied.');
      }
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.reply('⏳ Time out. No reaction collected.');
      }
    });
  }
};

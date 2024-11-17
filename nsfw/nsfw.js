import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { getNsfwMode, setNsfwMode } from '../../config/google-sheets.js'; 

export default {
  name: 'nsfw',
  description: 'Turn on/off NSFW mode',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) &&
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
        !message.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Staff')) {
      return message.reply('Bạn không có quyền sử dụng lệnh này.');
    }

    try {
      const serverId = message.guild.id;
      const botAvatar = message.client.user.displayAvatarURL();
      const userAvatar = message.author.displayAvatarURL();
      const userCommand = message.author.username;


      const nsfwMode = await getNsfwMode(serverId);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: "System",
          iconURL: botAvatar,
        })
        .setTitle(":warning: NSFW Mode")
        .setDescription(`${nsfwMode ? ":green_circle: NSFW Mode in this server is: on" : ":red_circle: NSFW Mode in this server is: off"}`)
        .setColor("#00b0f4")
        .setFooter({
          text: `Run by ${userCommand}`,
          iconURL: userAvatar,
        })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('nsfw-on')
            .setLabel('Bật')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('nsfw-off')
            .setLabel('Tắt')
            .setStyle(ButtonStyle.Danger),
        );

      await message.reply({ embeds: [embed], components: [row] });

    } catch (error) {
      console.error('Error executing nsfw command:', error);
      message.reply('An error occurred while executing the NSFW command.');
    }
  }
};

export const handleNsfwInteraction = async (interaction) => {
  try {
    const serverId = interaction.guild.id;
    const userId = interaction.user.id;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels) &&
        !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'Bạn không có quyền thay đổi chế độ NSFW.', ephemeral: true });
    }

    let newNsfwMode;

    if (interaction.customId === 'nsfw-on') {
      newNsfwMode = true;
    } else if (interaction.customId === 'nsfw-off') {
      newNsfwMode = false;
    } else {
      return;
    }

 
    await setNsfwMode(serverId, newNsfwMode);

    const botAvatar = interaction.client.user.displayAvatarURL();
    const userAvatar = interaction.user.displayAvatarURL();
    const userCommand = interaction.user.username;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "System",
        iconURL: botAvatar,
      })
      .setTitle(":warning: NSFW Mode")
      .setDescription(`${newNsfwMode ? ":green_circle: NSFW Mode in this server is: on" : ":red_circle: NSFW Mode in this server is: off"}`)
      .setColor("#00b0f4")
      .setFooter({
        text: `Run by ${userCommand}`,
        iconURL: userAvatar,
      })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('nsfw-on')
          .setLabel('Bật')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('nsfw-off')
          .setLabel('Tắt')
          .setStyle(ButtonStyle.Danger),
      );


    await interaction.update({ embeds: [embed], components: [row] });

  } catch (error) {
    console.error('Error handling NSFW interaction:', error);
    await interaction.reply({
      content: 'Có lỗi xảy ra khi xử lý yêu cầu.',
      ephemeral: true
    });
  }
};

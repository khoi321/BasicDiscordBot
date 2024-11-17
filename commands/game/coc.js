import ClashOfClansAPI from 'clash-of-clans-api';

const api = ClashOfClansAPI({
  token: 'API_TOKEN' //replace API_TOKEN to ur real API COC token (learn more at read me)
});

export default {
  name: 'coc',
  description: 'Get Clash of Clans player info based on player tag.',
  async execute(message, args) {
    const playerTag = args[0]; 

    if (!playerTag) {
      return message.reply('Please provide a valid player tag.');
    }

    try {
      const playerInfo = await api.playerByTag(playerTag);

      
      const responseMessage = `
        **Player Name**: ${playerInfo.name}
        **Player Tag**: ${playerInfo.tag}
        **Town Hall Level**: ${playerInfo.townHallLevel}
        **Experience Level**: ${playerInfo.expLevel}
        **Trophies**: ${playerInfo.trophies}
        **War Stars**: ${playerInfo.warStars}
        **Clan Name**: ${playerInfo.clan ? playerInfo.clan.name : 'No Clan'}
        **Clan Role**: ${playerInfo.role ? playerInfo.role : 'N/A'}
      `;

      await message.channel.send(responseMessage);

    } catch (error) {
      console.error('Error fetching player data:', error);
      await message.reply('An error occurred while fetching player data. Please ensure the tag is valid.');
    }
  }
};

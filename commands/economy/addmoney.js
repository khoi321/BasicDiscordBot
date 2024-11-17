import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserBalance, updateUserBalance, addUserToSheet } from '../../config/google-sheets-economy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const devIDPath = path.join(__dirname, '../../data/DevID.json');

const devData = JSON.parse(await fs.readFile(devIDPath, 'utf8'));
const devID = devData.devID;

const credentialsPath = path.join(__dirname, '../../config/credentials.json');
const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export default {
  name: 'addmoney',
  description: 'Add money to a user\'s balance.',
  async execute(message, args) {
    const authorId = message.author.id;

    if (authorId !== devID) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args.length < 2) {
      return message.reply('Usage: `!addmoney <@mention or user ID> <amount>`');
    }

    const userMention = args[0].replace(/[<@!>]/g, '');
    const amount = parseInt(args[1], 10);

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Please provide a valid amount of money to add.');
    }

    try {
      const user = await message.client.users.fetch(userMention);
      await addUserToSheet(userMention, user.username);
      const currentBalance = await getUserBalance(userMention);
      const newBalance = currentBalance + amount;
      await updateUserBalance(userMention, newBalance);
      await user.send(`You have received **${amount}**<:coin:1294299661368037458>! Your new balance is **${newBalance}**<:coin:1294299661368037458>.`);
      await message.reply(`:white_check_mark: **Success**\nAdded **${amount}**<:coin:1294299661368037458> to <@${userMention}>'s balance. New balance: **${newBalance}**<:coin:1294299661368037458>!`);
    } catch (error) {
      console.error('Error updating user balance:', error);
      await message.reply('There was an error updating the user\'s balance. Please try again later.');
    }
  },
};

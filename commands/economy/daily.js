import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserBalance, addUserToSheet } from '../../config/google-sheets-economy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../../config/credentials.json');

const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const cooldowns = new Map();

export default {
  name: 'daily',
  description: 'Claim your daily reward.',
  async execute(message) {
    const userId = message.author.id;
    const userName = message.author.username;

    const userExists = await checkUserExists(userId);

    if (!userExists) {
      return message.reply(`**${userName}**, you are not registered. Please use the \`!play\` command to get started.`);
    }

    const now = Date.now();
    const cooldownAmount = 24 * 60 * 60 * 1000;

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = Math.round((expirationTime - now) / 1000);
        return message.reply(`:stopwatch: **Next daily:** \`${(timeLeft / 3600).toFixed(2)} hours\``);
      }
    }

    let coins;
    const rand = Math.random() * 100;

    if (rand < 60) {
      coins = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    } else if (rand < 80) {
      coins = Math.floor(Math.random() * (500 - 301 + 1)) + 301;
    } else if (rand < 90) {
      coins = Math.floor(Math.random() * (800 - 501 + 1)) + 501;
    } else if (rand < 99) {
      coins = Math.floor(Math.random() * (999 - 801 + 1)) + 801;
    } else {
      coins = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
    }

    const currentBalance = await getUserBalance(userId);
    const newBalance = currentBalance + coins;

    await addUserToSheet(userId, userName);
    await updateUserBalance(userId, newBalance);

    cooldowns.set(userId, now);

    const timeLeft = cooldownAmount / 1000;
    await message.reply(`:white_check_mark: **Success**\n:busts_in_silhouette: **${userName}**, you get **${coins}** <:coin:1294299661368037458>!\n:stopwatch: Next daily: \`${(timeLeft / 3600).toFixed(2)} hours\``);
  },
};

async function checkUserExists(userId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1bI40ggCo7jJV65vOeh8dGzJpRDX4p-j_At2kYrxBLUc',
      range: 'USER_ECONOMY!A:D',
    });

    const rows = response.data.values || [];
    const userRow = rows.find(row => row[0] === userId);

    return userRow !== undefined;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

async function updateUserBalance(userId, newBalance) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: 'xxxxxxxxxxxxxxxxxx', //replace xxxxxxxxxxxxxxxxx with ur real sheet id
      range: 'USER_ECONOMY!A:D',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === userId);

    if (rowIndex !== -1) {
      rows[rowIndex][2] = newBalance;
      await sheets.spreadsheets.values.update({
        spreadsheetId: 'xxxxxxxxxxxxxxxxxxx', //replace xxxxxxxxxxxxxxxxx with ur real sheet id
        range: 'USER_ECONOMY!A:D',
        valueInputOption: 'RAW',
        resource: {
          values: rows,
        },
      });

      console.log(`Updated balance for user ${userId}: ${newBalance}`);
    }
  } catch (error) {
    console.error('Error updating user balance:', error);
  }
}

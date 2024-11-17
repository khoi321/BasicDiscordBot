import { google } from 'googleapis';
import fs from 'fs/promises'; 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../config/credentials.json');

const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = 'xxxxxxxxxxxx'; // ID của Google Sheet
const range = 'USER_ECONOMY!A:D'; // Tên trang tính


export const checkUserExists = async (userId) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const userExists = rows.some(row => row[0] === userId);
    
    return userExists;
  } catch (error) {
    console.error('Error checking user existence in Google Sheets:', error);
    return false; 
  }
};

export const addUserToSheet = async (userId, userName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === userId);

    if (rowIndex === -1) {
      rows.push([userId, userName, '0', 'false']);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: rows,
        },
      });

      console.log('User added successfully:', {
        spreadsheetId,
        range,
        values: rows,
      });
    } else {
      console.log('User already exists in the sheet:', userId);
    }
  } catch (error) {
    console.error('Error adding user to Google Sheets:', error);
  }
};

export const getUserBalance = async (userId) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      for (const row of rows) {
        if (row[0] === userId) {
          return parseInt(row[2], 10) || 0; 
        }
      }
    } else {
      console.log('No data found.');
      return 0; 
    }
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return 0; 
  }
};

export const updateUserBalance = async (userId, newBalance) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === userId);

    if (rowIndex !== -1) {
      rows[rowIndex][2] = newBalance; 
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
          values: rows,
        },
      });
    }
  } catch (error) {
    console.error('Error updating user balance:', error);
  }
};

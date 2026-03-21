const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const rootDir = path.resolve(__dirname, '..', '..');

function readGoogleServiceAccountFromBase64() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 || '';
  if (!encoded) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return {
      clientEmail: parsed.client_email || '',
      privateKey: parsed.private_key || ''
    };
  } catch (error) {
    console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON_B64:', error.message);
    return null;
  }
}

const serviceAccountFromBase64 = readGoogleServiceAccountFromBase64();

module.exports = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/note_to_excel',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  excelFilePath: path.resolve(rootDir, process.env.EXCEL_FILE_PATH || './storage/data/notes.xlsx'),
  driveSyncEnabled: process.env.DRIVE_SYNC_ENABLED === 'true',
  driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  driveFileId: process.env.GOOGLE_DRIVE_FILE_ID || '',
  driveFileName: process.env.GOOGLE_DRIVE_FILE_NAME || 'notes.xlsx',
  googleServiceAccountEmail:
    (serviceAccountFromBase64 && serviceAccountFromBase64.clientEmail) ||
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    '',
  googleServiceAccountPrivateKey:
    (serviceAccountFromBase64 && serviceAccountFromBase64.privateKey) ||
    (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '')
};

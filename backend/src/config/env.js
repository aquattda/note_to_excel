const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const rootDir = path.resolve(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/note_to_excel',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  excelFilePath: path.resolve(rootDir, process.env.EXCEL_FILE_PATH || './storage/data/notes.xlsx'),
  driveSyncEnabled: process.env.DRIVE_SYNC_ENABLED === 'true',
  driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  driveFileId: process.env.GOOGLE_DRIVE_FILE_ID || '',
  driveFileName: process.env.GOOGLE_DRIVE_FILE_NAME || 'notes.xlsx',
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
  googleServiceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
    : ''
};

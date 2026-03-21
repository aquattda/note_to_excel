const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const rootDir = path.resolve(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/note_to_excel',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  excelFilePath: path.resolve(rootDir, process.env.EXCEL_FILE_PATH || './storage/data/notes.xlsx')
};

const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');
const { excelSyncService } = require('../services/serviceContainer');

async function downloadExcelHandler(req, res, next) {
  try {
    await fs.mkdir(path.dirname(env.excelFilePath), { recursive: true });
    await excelSyncService.enqueueSync('download-excel');
    return res.download(env.excelFilePath, 'notes.xlsx');
  } catch (error) {
    return next(error);
  }
}

module.exports = { downloadExcelHandler };

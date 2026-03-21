const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');
const { excelSyncService, driveSyncService } = require('../services/serviceContainer');

async function downloadExcelHandler(req, res, next) {
  try {
    await fs.mkdir(path.dirname(env.excelFilePath), { recursive: true });
    await excelSyncService.enqueueSync('download-excel');

    if (driveSyncService && driveSyncService.enabled) {
      const sentFromDrive = await driveSyncService.streamFileToResponse(res);
      if (sentFromDrive) {
        return undefined;
      }
    }

    return res.download(env.excelFilePath, 'notes.xlsx');
  } catch (error) {
    return next(error);
  }
}

module.exports = { downloadExcelHandler };

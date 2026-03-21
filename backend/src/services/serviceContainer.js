const env = require('../config/env');
const { WorkbookService } = require('./excel/workbookService');
const { ExcelSyncService } = require('./excel/excelSyncService');
const { DriveSyncService } = require('./excel/driveSyncService');

const workbookService = new WorkbookService(env.excelFilePath);
const driveSyncService = new DriveSyncService({
  enabled: env.driveSyncEnabled,
  driveFolderId: env.driveFolderId,
  driveFileId: env.driveFileId,
  driveFileName: env.driveFileName,
  serviceAccountEmail: env.googleServiceAccountEmail,
  serviceAccountPrivateKey: env.googleServiceAccountPrivateKey
});
const excelSyncService = new ExcelSyncService(workbookService, driveSyncService);

module.exports = {
  workbookService,
  excelSyncService,
  driveSyncService
};

const env = require('../config/env');
const { WorkbookService } = require('./excel/workbookService');
const { ExcelSyncService } = require('./excel/excelSyncService');

const workbookService = new WorkbookService(env.excelFilePath);
const excelSyncService = new ExcelSyncService(workbookService);

module.exports = {
  workbookService,
  excelSyncService
};

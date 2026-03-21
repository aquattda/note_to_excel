function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ExcelSyncService {
  constructor(workbookService, driveSyncService) {
    this.workbookService = workbookService;
    this.driveSyncService = driveSyncService;
    this.chain = Promise.resolve();
    this.lastSyncResult = {
      status: 'pending',
      message: 'Sync has not been performed yet'
    };
  }

  async syncWithRetry(reason = 'manual') {
    const maxAttempts = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const workbookResult = await this.workbookService.rebuildWorkbookFromDatabase();
        let driveResult = {
          status: 'disabled',
          message: 'Google Drive sync is disabled'
        };

        if (this.driveSyncService) {
          driveResult = await this.driveSyncService.uploadWorkbook(workbookResult.filePath);
        }

        this.lastSyncResult = {
          status: 'success',
          reason,
          message: 'Excel sync completed',
          meta: {
            workbook: workbookResult,
            drive: driveResult
          }
        };
        return this.lastSyncResult;
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await sleep(150 * attempt);
        }
      }
    }

    this.lastSyncResult = {
      status: 'pending',
      reason,
      message: lastError ? lastError.message : 'Excel sync failed'
    };

    setTimeout(() => {
      this.enqueueSync(`retry:${reason}`).catch(() => {
        // Intentionally ignored, lastSyncResult keeps latest state.
      });
    }, 1000);

    return this.lastSyncResult;
  }

  enqueueSync(reason = 'mutation') {
    const run = () => this.syncWithRetry(reason);
    const task = this.chain.then(run, run);
    this.chain = task.catch(() => undefined);
    return task;
  }

  getLastSyncResult() {
    return this.lastSyncResult;
  }
}

module.exports = { ExcelSyncService };

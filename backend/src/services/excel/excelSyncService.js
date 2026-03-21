function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ExcelSyncService {
  constructor(workbookService) {
    this.workbookService = workbookService;
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
        const result = await this.workbookService.rebuildWorkbookFromDatabase();
        this.lastSyncResult = {
          status: 'success',
          reason,
          message: 'Excel sync completed',
          meta: result
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

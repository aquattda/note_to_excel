const { ExcelSyncService } = require('../services/excel/excelSyncService');

describe('excelSyncService', () => {
  it('retries once and then succeeds', async () => {
    const workbookService = {
      rebuildWorkbookFromDatabase: jest
        .fn()
        .mockRejectedValueOnce(new Error('temporary'))
        .mockResolvedValueOnce({ groups: 1, notes: 2 })
    };

    const service = new ExcelSyncService(workbookService);
    const result = await service.enqueueSync('test');

    expect(result.status).toBe('success');
    expect(workbookService.rebuildWorkbookFromDatabase).toHaveBeenCalledTimes(2);
  });

  it('serializes sync requests', async () => {
    const callOrder = [];
    const workbookService = {
      rebuildWorkbookFromDatabase: jest.fn(async () => {
        callOrder.push('start');
        await new Promise((resolve) => setTimeout(resolve, 30));
        callOrder.push('end');
        return { groups: 1, notes: 1 };
      })
    };

    const service = new ExcelSyncService(workbookService);
    await Promise.all([service.enqueueSync('a'), service.enqueueSync('b')]);

    expect(workbookService.rebuildWorkbookFromDatabase).toHaveBeenCalledTimes(2);
    expect(callOrder).toEqual(['start', 'end', 'start', 'end']);
  });
});

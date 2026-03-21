const { makeSafeSheetName } = require('../utils/excel/makeSafeSheetName');

describe('makeSafeSheetName', () => {
  it('removes forbidden characters and keeps max length', () => {
    const name = makeSafeSheetName('A/Very*Long?Name[Forbidden]12345678901234567890');
    expect(name).not.toMatch(/[\\\/?*\[\]]/);
    expect(name.length).toBeLessThanOrEqual(31);
  });

  it('adds suffix for duplicate names', () => {
    const existing = new Set(['phan ga']);
    const second = makeSafeSheetName('phan ga', existing);
    expect(second).toBe('phan ga (2)');
  });
});

const { sortNotesForSheet } = require('../utils/sort/sortNotesForSheet');

describe('sortNotesForSheet', () => {
  it('puts annotation first, then sorts by annotation and createdAt', () => {
    const notes = [
      { _id: 1, annotation: '', createdAt: '2025-01-01T10:00:00.000Z' },
      { _id: 2, annotation: 'zeta', createdAt: '2025-01-01T09:00:00.000Z' },
      { _id: 3, annotation: 'Alpha', createdAt: '2025-01-01T08:00:00.000Z' },
      { _id: 4, annotation: 'alpha', createdAt: '2025-01-01T11:00:00.000Z' }
    ];

    const sorted = sortNotesForSheet(notes).map((n) => n._id);
    expect(sorted).toEqual([3, 4, 2, 1]);
  });
});

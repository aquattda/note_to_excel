const Note = require('../models/Note');
const Group = require('../models/Group');
const {
  connectMemoryDb,
  clearMemoryDb,
  closeMemoryDb
} = require('./helpers/testDb');
const { createNote } = require('../services/noteService');

describe('concurrency create note flow', () => {
  beforeAll(async () => {
    await connectMemoryDb();
  });

  afterEach(async () => {
    await clearMemoryDb();
  });

  afterAll(async () => {
    await closeMemoryDb();
  });

  it('creates notes but only one group for equivalent contents', async () => {
    const payloads = [
      { originalContent: 'phân gà', url: 'https://a.com', annotation: 'B' },
      { originalContent: 'PHAN_GA', url: 'https://b.com', annotation: '' },
      { originalContent: ' PhAn   ga ', url: 'https://c.com', annotation: 'A' },
      { originalContent: 'phan-ga', url: 'https://d.com', annotation: '' }
    ];

    await Promise.all(payloads.map((payload) => createNote(payload)));

    const groups = await Group.find({ normalizedKey: 'phan ga' });
    const notes = await Note.find({ normalizedKeySnapshot: 'phan ga' });

    expect(groups).toHaveLength(1);
    expect(notes).toHaveLength(4);
  });
});

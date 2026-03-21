const Group = require('../models/Group');
const {
  connectMemoryDb,
  clearMemoryDb,
  closeMemoryDb
} = require('./helpers/testDb');
const {
  getOrCreateGroupByNormalizedKey
} = require('../services/groupService');

describe('group matching logic', () => {
  beforeAll(async () => {
    await connectMemoryDb();
  });

  afterEach(async () => {
    await clearMemoryDb();
  });

  afterAll(async () => {
    await closeMemoryDb();
  });

  it('returns same group for same normalized key in concurrent calls', async () => {
    const payload = {
      normalizedKey: 'phan ga',
      originalContent: 'PHAN_GA'
    };

    const results = await Promise.all(
      Array.from({ length: 10 }).map(() => getOrCreateGroupByNormalizedKey(payload))
    );

    const ids = new Set(results.map((item) => String(item._id)));
    expect(ids.size).toBe(1);

    const totalGroups = await Group.countDocuments({ normalizedKey: 'phan ga' });
    expect(totalGroups).toBe(1);
  });
});

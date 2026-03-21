const { connectToDatabase } = require('../config/db');
const env = require('../config/env');
const Group = require('../models/Group');
const Note = require('../models/Note');
const {
  normalizeContent,
  makeDisplayName
} = require('../utils/normalize/normalizeContent');
const { makeSafeSheetName } = require('../utils/excel/makeSafeSheetName');
const { excelSyncService } = require('../services/serviceContainer');

const seedNotes = [
  {
    originalContent: 'Phân gà',
    url: 'https://example.com/article-1',
    annotation: 'Nguồn A'
  },
  {
    originalContent: 'PHAN_GA',
    url: 'https://example.com/article-2',
    annotation: ''
  },
  {
    originalContent: 'Thức ăn cá',
    url: 'https://example.com/fish-food',
    annotation: 'Mẹo nhanh'
  }
];

async function upsertNote(item) {
  const normalizedKey = normalizeContent(item.originalContent);
  const existingGroup = await Group.findOne({ normalizedKey });

  const group =
    existingGroup ||
    (await Group.create({
      displayName: makeDisplayName(item.originalContent, normalizedKey),
      normalizedKey,
      sheetName: makeSafeSheetName(item.originalContent)
    }));

  await Note.create({
    groupId: group._id,
    originalContent: item.originalContent,
    normalizedKeySnapshot: normalizedKey,
    url: item.url,
    annotation: item.annotation
  });
}

async function run() {
  await connectToDatabase(env.mongoUri);
  await Note.deleteMany({});
  await Group.deleteMany({});

  for (const item of seedNotes) {
    await upsertNote(item);
  }

  await excelSyncService.enqueueSync('seed');
  console.log('Seeded data and synchronized Excel');
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

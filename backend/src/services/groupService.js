const Group = require('../models/Group');
const Note = require('../models/Note');
const { makeDisplayName } = require('../utils/normalize/normalizeContent');
const { makeSafeSheetName } = require('../utils/excel/makeSafeSheetName');

let groupIndexesReadyPromise;

function ensureGroupIndexesReady() {
  if (!groupIndexesReadyPromise) {
    groupIndexesReadyPromise = Group.init();
  }
  return groupIndexesReadyPromise;
}

async function getOrCreateGroupByNormalizedKey({ normalizedKey, originalContent }) {
  await ensureGroupIndexesReady();

  const displayName = makeDisplayName(originalContent, normalizedKey || 'untitled');
  await Group.updateOne(
    { normalizedKey },
    {
      $setOnInsert: {
        displayName,
        normalizedKey,
        sheetName: makeSafeSheetName(displayName)
      }
    },
    { upsert: true }
  );

  return Group.findOne({ normalizedKey });
}

async function listGroups() {
  const groups = await Group.find({}).sort({ updatedAt: -1 }).lean();
  const counts = await Note.aggregate([
    {
      $group: {
        _id: '$groupId',
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

  return groups.map((group) => ({
    ...group,
    noteCount: countMap.get(String(group._id)) || 0
  }));
}

async function getGroupById(groupId) {
  return Group.findById(groupId).lean();
}

async function renameGroup(groupId, displayName) {
  const group = await Group.findById(groupId);
  if (!group) {
    return null;
  }

  group.displayName = makeDisplayName(displayName, group.displayName);
  group.sheetName = makeSafeSheetName(group.displayName);
  await group.save();

  return group.toObject();
}

module.exports = {
  getOrCreateGroupByNormalizedKey,
  listGroups,
  getGroupById,
  renameGroup
};

const Group = require('../models/Group');
const Note = require('../models/Note');
const {
  normalizeContent,
  makeDisplayName
} = require('../utils/normalize/normalizeContent');
const { sortNotesForSheet } = require('../utils/sort/sortNotesForSheet');
const {
  getOrCreateGroupByNormalizedKey
} = require('./groupService');

function buildValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function assertRequiredFields({ originalContent, url }) {
  if (!originalContent || !String(originalContent).trim()) {
    throw buildValidationError('originalContent is required');
  }
  if (!url || !String(url).trim()) {
    throw buildValidationError('url is required');
  }
}

async function createNote(payload) {
  assertRequiredFields(payload);

  const normalizedKey = normalizeContent(payload.originalContent);
  if (!normalizedKey) {
    throw buildValidationError('content is empty after normalization');
  }

  const group = await getOrCreateGroupByNormalizedKey({
    normalizedKey,
    originalContent: payload.originalContent
  });

  const note = await Note.create({
    groupId: group._id,
    originalContent: payload.originalContent,
    normalizedKeySnapshot: normalizedKey,
    url: payload.url,
    annotation: payload.annotation || ''
  });

  return {
    note: note.toObject(),
    group: group.toObject()
  };
}

async function listNotesByGroup(groupId) {
  const notes = await Note.find({ groupId }).lean();
  return sortNotesForSheet(notes);
}

async function updateNote(noteId, payload) {
  const note = await Note.findById(noteId);
  if (!note) {
    return null;
  }

  const nextOriginalContent =
    payload.originalContent !== undefined ? payload.originalContent : note.originalContent;
  const nextUrl = payload.url !== undefined ? payload.url : note.url;
  const nextAnnotation = payload.annotation !== undefined ? payload.annotation : note.annotation;

  assertRequiredFields({ originalContent: nextOriginalContent, url: nextUrl });

  const normalizedKey = normalizeContent(nextOriginalContent);
  if (!normalizedKey) {
    throw buildValidationError('content is empty after normalization');
  }

  const group = await getOrCreateGroupByNormalizedKey({
    normalizedKey,
    originalContent: nextOriginalContent
  });

  note.groupId = group._id;
  note.originalContent = nextOriginalContent;
  note.normalizedKeySnapshot = normalizedKey;
  note.url = nextUrl;
  note.annotation = nextAnnotation || '';
  await note.save();

  return {
    note: note.toObject(),
    group: group.toObject()
  };
}

async function deleteNote(noteId) {
  const note = await Note.findByIdAndDelete(noteId).lean();
  if (!note) {
    return null;
  }

  const remainingCount = await Note.countDocuments({ groupId: note.groupId });
  if (remainingCount === 0) {
    await Group.findByIdAndDelete(note.groupId);
  }

  return note;
}

module.exports = {
  createNote,
  listNotesByGroup,
  updateNote,
  deleteNote
};

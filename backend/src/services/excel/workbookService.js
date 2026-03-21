const fs = require('fs/promises');
const path = require('path');
const ExcelJS = require('exceljs');
const Group = require('../../models/Group');
const Note = require('../../models/Note');
const { sortNotesForSheet } = require('../../utils/sort/sortNotesForSheet');
const { makeSafeSheetName } = require('../../utils/excel/makeSafeSheetName');

function buildSheetRows(notes) {
  const sorted = sortNotesForSheet(notes);
  return sorted.map((note) => ({
    content: note.originalContent,
    url: note.url,
    annotation: note.annotation || '',
    createdAt: new Date(note.createdAt).toISOString(),
    noteId: String(note._id)
  }));
}

async function ensureDirectory(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

class WorkbookService {
  constructor(excelFilePath) {
    this.excelFilePath = excelFilePath;
  }

  async rebuildWorkbookFromDatabase() {
    await ensureDirectory(this.excelFilePath);

    const workbook = new ExcelJS.Workbook();
    const groups = await Group.find({}).sort({ createdAt: 1 }).lean();
    const notes = await Note.find({}).sort({ createdAt: 1 }).lean();

    const notesByGroup = new Map();
    for (const note of notes) {
      const groupId = String(note.groupId);
      if (!notesByGroup.has(groupId)) {
        notesByGroup.set(groupId, []);
      }
      notesByGroup.get(groupId).push(note);
    }

    const usedSheetNames = new Set();
    const groupSheetUpdates = [];

    for (const group of groups) {
      const groupId = String(group._id);
      const rawName = group.sheetName || group.displayName || group.normalizedKey;
      const safeSheetName = makeSafeSheetName(rawName, usedSheetNames);
      usedSheetNames.add(safeSheetName);

      if (safeSheetName !== group.sheetName) {
        groupSheetUpdates.push({
          updateOne: {
            filter: { _id: group._id },
            update: { $set: { sheetName: safeSheetName } }
          }
        });
      }

      const sheet = workbook.addWorksheet(safeSheetName);
      sheet.columns = [
        { header: 'Content', key: 'content', width: 40 },
        { header: 'URL', key: 'url', width: 60 },
        { header: 'Annotation', key: 'annotation', width: 32 },
        { header: 'Created At (ISO)', key: 'createdAt', width: 28 },
        { header: 'Note ID', key: 'noteId', width: 28 }
      ];

      const rows = buildSheetRows(notesByGroup.get(groupId) || []);
      rows.forEach((row) => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
    }

    if (groups.length === 0) {
      const emptySheet = workbook.addWorksheet('Notes');
      emptySheet.columns = [
        { header: 'Content', key: 'content', width: 40 },
        { header: 'URL', key: 'url', width: 60 },
        { header: 'Annotation', key: 'annotation', width: 32 },
        { header: 'Created At (ISO)', key: 'createdAt', width: 28 },
        { header: 'Note ID', key: 'noteId', width: 28 }
      ];
      emptySheet.getRow(1).font = { bold: true };
    }

    const tempFilePath = `${this.excelFilePath}.tmp`;
    await workbook.xlsx.writeFile(tempFilePath);
    await fs.rm(this.excelFilePath, { force: true });
    await fs.rename(tempFilePath, this.excelFilePath);

    if (groupSheetUpdates.length > 0) {
      await Group.bulkWrite(groupSheetUpdates);
    }

    return {
      groups: groups.length,
      notes: notes.length,
      filePath: this.excelFilePath
    };
  }
}

module.exports = { WorkbookService };

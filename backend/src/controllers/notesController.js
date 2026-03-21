const {
  createNote,
  listNotesByGroup,
  updateNote,
  deleteNote
} = require('../services/noteService');
const { getGroupById } = require('../services/groupService');
const { excelSyncService } = require('../services/serviceContainer');

async function createNoteHandler(req, res, next) {
  try {
    const result = await createNote(req.body);
    const excelSync = await excelSyncService.enqueueSync('create-note');

    return res.status(201).json({
      success: true,
      note: result.note,
      group: result.group,
      excelSyncStatus: excelSync.status,
      message:
        excelSync.status === 'success'
          ? 'Saved note and synchronized Excel successfully'
          : 'Saved note to database. Excel sync is pending retry'
    });
  } catch (error) {
    return next(error);
  }
}

async function updateNoteHandler(req, res, next) {
  try {
    const result = await updateNote(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const excelSync = await excelSyncService.enqueueSync('update-note');
    return res.json({
      success: true,
      note: result.note,
      group: result.group,
      excelSyncStatus: excelSync.status,
      message:
        excelSync.status === 'success'
          ? 'Updated note and synchronized Excel successfully'
          : 'Updated note in database. Excel sync is pending retry'
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteNoteHandler(req, res, next) {
  try {
    const note = await deleteNote(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const excelSync = await excelSyncService.enqueueSync('delete-note');
    return res.json({
      success: true,
      note,
      excelSyncStatus: excelSync.status,
      message:
        excelSync.status === 'success'
          ? 'Deleted note and synchronized Excel successfully'
          : 'Deleted note in database. Excel sync is pending retry'
    });
  } catch (error) {
    return next(error);
  }
}

async function listGroupNotesHandler(req, res, next) {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const notes = await listNotesByGroup(req.params.id);
    return res.json({ success: true, group, notes });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createNoteHandler,
  updateNoteHandler,
  deleteNoteHandler,
  listGroupNotesHandler
};

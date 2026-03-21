const {
  listGroups,
  getGroupById,
  renameGroup
} = require('../services/groupService');
const { listNotesByGroup } = require('../services/noteService');
const { excelSyncService } = require('../services/serviceContainer');

async function listGroupsHandler(req, res, next) {
  try {
    const groups = await listGroups();
    return res.json({ success: true, groups });
  } catch (error) {
    return next(error);
  }
}

async function getGroupHandler(req, res, next) {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    return res.json({ success: true, group });
  } catch (error) {
    return next(error);
  }
}

async function getGroupNotesHandler(req, res, next) {
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

async function patchGroupHandler(req, res, next) {
  try {
    if (!req.body.displayName || !String(req.body.displayName).trim()) {
      return res.status(400).json({ success: false, message: 'displayName is required' });
    }

    const group = await renameGroup(req.params.id, req.body.displayName);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const excelSync = await excelSyncService.enqueueSync('rename-group');
    return res.json({
      success: true,
      group,
      excelSyncStatus: excelSync.status,
      message:
        excelSync.status === 'success'
          ? 'Updated group and synchronized Excel successfully'
          : 'Updated group in database. Excel sync is pending retry'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listGroupsHandler,
  getGroupHandler,
  getGroupNotesHandler,
  patchGroupHandler
};

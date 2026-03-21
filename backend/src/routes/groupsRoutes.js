const express = require('express');
const {
  listGroupsHandler,
  getGroupHandler,
  getGroupNotesHandler,
  patchGroupHandler
} = require('../controllers/groupsController');

const router = express.Router();

router.get('/', listGroupsHandler);
router.get('/:id', getGroupHandler);
router.get('/:id/notes', getGroupNotesHandler);
router.patch('/:id', patchGroupHandler);

module.exports = router;

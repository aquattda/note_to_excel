const express = require('express');
const {
  createNoteHandler,
  updateNoteHandler,
  deleteNoteHandler
} = require('../controllers/notesController');

const router = express.Router();

router.post('/', createNoteHandler);
router.patch('/:id', updateNoteHandler);
router.delete('/:id', deleteNoteHandler);

module.exports = router;

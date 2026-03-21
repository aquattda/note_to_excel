const express = require('express');
const { downloadExcelHandler } = require('../controllers/excelController');

const router = express.Router();

router.get('/download', downloadExcelHandler);

module.exports = router;

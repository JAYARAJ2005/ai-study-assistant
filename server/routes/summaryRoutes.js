const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createSummary, getSummaryHistory, getSummaryById, deleteSummary } = require('../controllers/summaryController');

router.get('/history', authMiddleware, getSummaryHistory);
router.get('/item/:summaryId', authMiddleware, getSummaryById);
router.delete('/item/:summaryId', authMiddleware, deleteSummary);
router.post('/:docId', authMiddleware, createSummary);

module.exports = router;
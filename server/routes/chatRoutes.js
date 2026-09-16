const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  sendMessage,
  getChatHistory,
  createGeneralSession,
  getGeneralSessionHistory,
  sendGeneralSessionMessage,
  getAllSessions,
  deleteSession,
} = require('../controllers/chatController');

router.get('/sessions', authMiddleware, getAllSessions);
router.post('/general/new', authMiddleware, createGeneralSession);
router.get('/general/:sessionId', authMiddleware, getGeneralSessionHistory);
router.post('/general/:sessionId', authMiddleware, sendGeneralSessionMessage);
router.delete('/session/:type/:id', authMiddleware, deleteSession);
router.get('/:docId', authMiddleware, getChatHistory);
router.post('/:docId', authMiddleware, sendMessage);

module.exports = router;
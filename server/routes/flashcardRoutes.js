const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createFlashcards, getFlashcardHistory, getFlashcardById, deleteFlashcards } = require('../controllers/flashcardController');

router.get('/history', authMiddleware, getFlashcardHistory);
router.get('/item/:setId', authMiddleware, getFlashcardById);
router.delete('/item/:setId', authMiddleware, deleteFlashcards);
router.post('/:docId', authMiddleware, createFlashcards);

module.exports = router;
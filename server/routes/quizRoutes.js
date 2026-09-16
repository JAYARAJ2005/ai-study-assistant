const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createQuiz, getQuizHistory, getQuizById, deleteQuiz } = require('../controllers/quizController');

router.get('/history', authMiddleware, getQuizHistory);
router.get('/item/:quizId', authMiddleware, getQuizById);
router.delete('/item/:quizId', authMiddleware, deleteQuiz);
router.post('/:docId', authMiddleware, createQuiz);

module.exports = router;
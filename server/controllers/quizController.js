const Document = require('../models/Document');
const Quiz = require('../models/Quiz');
const { generateQuiz } = require('../services/aiService');

exports.createQuiz = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await Document.findById(docId);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    const questions = await generateQuiz(document.extractedText);
    const newQuiz = await Quiz.create({ documentId: docId, questions });
    res.status(201).json({ message: 'Quiz generated successfully', quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getQuizHistory = async (req, res) => {
  try {
    const userDocs = await Document.find({ userId: req.userId }).select('_id filename');
    const docMap = {};
    userDocs.forEach((d) => { docMap[d._id] = d.filename; });
    const docIds = userDocs.map((d) => d._id);
    const quizzes = await Quiz.find({ documentId: { $in: docIds } }).sort({ createdAt: -1 });
    const formatted = quizzes.map((q) => ({
      id: q._id,
      filename: docMap[q.documentId] || 'Unknown document',
      preview: `${q.questions.length} questions`,
      createdAt: q.createdAt,
    }));
    res.status(200).json({ history: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const document = await Document.findOne({ _id: quiz.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ quiz, filename: document.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const document = await Document.findOne({ _id: quiz.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ message: 'Quiz not found' });
    await Quiz.deleteOne({ _id: quizId });
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
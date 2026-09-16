const Document = require('../models/Document');
const Quiz = require('../models/Quiz');
const Summary = require('../models/Summary');
const Flashcard = require('../models/Flashcard');

exports.getStats = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId }).select('_id');
    const docIds = documents.map((doc) => doc._id);

    const [summaryCount, quizCount, flashcardCount] = await Promise.all([
      Summary.countDocuments({ documentId: { $in: docIds } }),
      Quiz.countDocuments({ documentId: { $in: docIds } }),
      Flashcard.countDocuments({ documentId: { $in: docIds } }),
    ]);

    res.status(200).json({
      notes: documents.length,
      summaries: summaryCount,
      quizzes: quizCount,
      flashcards: flashcardCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
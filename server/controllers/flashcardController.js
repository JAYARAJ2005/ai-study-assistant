const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const { generateFlashcards } = require('../services/aiService');

exports.createFlashcards = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await Document.findById(docId);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    const cards = await generateFlashcards(document.extractedText);
    const newSet = await Flashcard.create({ documentId: docId, cards });
    res.status(201).json({ message: 'Flashcards generated successfully', flashcards: newSet });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFlashcardHistory = async (req, res) => {
  try {
    const userDocs = await Document.find({ userId: req.userId }).select('_id filename');
    const docMap = {};
    userDocs.forEach((d) => { docMap[d._id] = d.filename; });
    const docIds = userDocs.map((d) => d._id);
    const sets = await Flashcard.find({ documentId: { $in: docIds } }).sort({ createdAt: -1 });
    const formatted = sets.map((s) => ({
      id: s._id,
      filename: docMap[s.documentId] || 'Unknown document',
      preview: `${s.cards.length} cards`,
      createdAt: s.createdAt,
    }));
    res.status(200).json({ history: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getFlashcardById = async (req, res) => {
  try {
    const { setId } = req.params;
    const set = await Flashcard.findById(setId);
    if (!set) return res.status(404).json({ message: 'Flashcard set not found' });
    const document = await Document.findOne({ _id: set.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ message: 'Flashcard set not found' });
    res.status(200).json({ flashcards: set, filename: document.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteFlashcards = async (req, res) => {
  try {
    const { setId } = req.params;
    const set = await Flashcard.findById(setId);
    if (!set) return res.status(404).json({ message: 'Flashcard set not found' });
    const document = await Document.findOne({ _id: set.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ message: 'Flashcard set not found' });
    await Flashcard.deleteOne({ _id: setId });
    res.status(200).json({ message: 'Flashcard set deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
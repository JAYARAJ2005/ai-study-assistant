const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
});

const flashcardSetSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  cards: { type: [cardSchema], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSetSchema);
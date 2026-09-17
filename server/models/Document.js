const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  extractedText: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
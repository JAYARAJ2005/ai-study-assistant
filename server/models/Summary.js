const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Summary', summarySchema);
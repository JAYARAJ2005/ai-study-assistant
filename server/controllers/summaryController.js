const Document = require('../models/Document');
const Summary = require('../models/Summary');
const { generateSummary } = require('../services/aiService');

exports.createSummary = async (req, res) => {
  try {
    const { docId } = req.params;
    const document = await Document.findById(docId);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    const summaryText = await generateSummary(document.extractedText);
    const newSummary = await Summary.create({ documentId: docId, content: summaryText });
    res.status(201).json({ message: 'Summary generated successfully', summary: newSummary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSummaryHistory = async (req, res) => {
  try {
    const userDocs = await Document.find({ userId: req.userId }).select('_id filename');
    const docMap = {};
    userDocs.forEach((d) => { docMap[d._id] = d.filename; });
    const docIds = userDocs.map((d) => d._id);
    const summaries = await Summary.find({ documentId: { $in: docIds } }).sort({ createdAt: -1 });
    const formatted = summaries.map((s) => ({
      id: s._id,
      filename: docMap[s.documentId] || 'Unknown document',
      preview: s.content.slice(0, 60),
      createdAt: s.createdAt,
    }));
    res.status(200).json({ history: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSummaryById = async (req, res) => {
  try {
    const { summaryId } = req.params;
    const summary = await Summary.findById(summaryId);
    if (!summary) return res.status(404).json({ message: 'Summary not found' });
    const document = await Document.findOne({ _id: summary.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ message: 'Summary not found' });
    res.status(200).json({ summary, filename: document.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSummary = async (req, res) => {
  try {
    const { summaryId } = req.params;
    const summary = await Summary.findById(summaryId);
    if (!summary) return res.status(404).json({ message: 'Summary not found' });
    const document = await Document.findOne({ _id: summary.documentId, userId: req.userId });
    if (!document) return res.status(404).json({ message: 'Summary not found' });
    await Summary.deleteOne({ _id: summaryId });
    res.status(200).json({ message: 'Summary deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
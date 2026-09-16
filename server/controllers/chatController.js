const Document = require('../models/Document');
const ChatSession = require('../models/ChatSession');
const { generateChatResponse } = require('../services/aiService');

// Converts stored session messages into the {role, parts} format Gemini expects
function toGeminiHistory(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

exports.sendMessage = async (req, res) => {
  try {
    const { docId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const document = await Document.findById(docId);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    let session = await ChatSession.findOne({ userId: req.userId, documentId: docId });
    if (!session) session = await ChatSession.create({ userId: req.userId, documentId: docId, messages: [] });

    const history = toGeminiHistory(session.messages);
    const aiReply = await generateChatResponse(history, document.extractedText, message);

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiReply });
    await session.save();
    res.status(200).json({ message: 'Reply generated', reply: aiReply, session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { docId } = req.params;
    const session = await ChatSession.findOne({ userId: req.userId, documentId: docId });
    res.status(200).json({ messages: session ? session.messages : [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createGeneralSession = async (req, res) => {
  try {
    const session = await ChatSession.create({ userId: req.userId, documentId: null, messages: [] });
    res.status(201).json({ sessionId: session._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getGeneralSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ _id: sessionId, userId: req.userId, documentId: null });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ messages: session.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendGeneralSessionMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const session = await ChatSession.findOne({ _id: sessionId, userId: req.userId, documentId: null });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const history = toGeminiHistory(session.messages);
    const aiReply = await generateChatResponse(history, '', message);

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiReply });
    await session.save();
    res.status(200).json({ message: 'Reply generated', reply: aiReply });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId })
      .populate('documentId', 'filename')
      .select('documentId messages updatedAt')
      .sort({ updatedAt: -1 });

    const formatted = sessions
      .filter((s) => s.messages.length > 0)
      .map((s) => {
        if (s.documentId) {
          return {
            type: 'document',
            id: s.documentId._id,
            filename: s.documentId.filename,
            lastMessage: s.messages[s.messages.length - 1]?.content?.slice(0, 60) || '',
            updatedAt: s.updatedAt,
          };
        }
        return {
          type: 'general',
          id: s._id,
          filename: `General Chat — ${new Date(s.updatedAt).toLocaleDateString()}`,
          lastMessage: s.messages[s.messages.length - 1]?.content?.slice(0, 60) || '',
          updatedAt: s.updatedAt,
        };
      });

    res.status(200).json({ sessions: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { type, id } = req.params;
    let session;
    if (type === 'document') {
      session = await ChatSession.findOne({ userId: req.userId, documentId: id });
    } else {
      session = await ChatSession.findOne({ _id: id, userId: req.userId, documentId: null });
    }
    if (!session) return res.status(404).json({ message: 'Chat session not found' });
    await ChatSession.deleteOne({ _id: session._id });
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
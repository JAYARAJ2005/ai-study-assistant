const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { YoutubeTranscript } = require('youtube-transcript');
const Document = require('../models/Document');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const ext = originalName.split('.').pop().toLowerCase();

    let extractedText = '';

    if (ext === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (ext === 'txt') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    const newDoc = await Document.create({
      userId: req.userId,
      filename: originalName,
      fileType: ext,
      extractedText,
    });

    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'File uploaded and processed successfully',
      documentId: newDoc._id,
      preview: extractedText.slice(0, 300),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

exports.createFromYoutube = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'Please provide a YouTube video URL' });
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return res.status(400).json({ message: 'Could not recognize a valid YouTube URL' });
    }

    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (transcriptErr) {
      return res.status(400).json({
        message: 'Could not fetch a transcript for this video. It may not have captions available.',
      });
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      return res.status(400).json({
        message: 'No transcript/captions found for this video.',
      });
    }

    const extractedText = transcriptItems.map((item) => item.text).join(' ');

    const newDoc = await Document.create({
      userId: req.userId,
      filename: `YouTube: ${videoId}`,
      fileType: 'youtube',
      extractedText,
    });

    res.status(201).json({
      message: 'Transcript fetched and processed successfully',
      documentId: newDoc._id,
      preview: extractedText.slice(0, 300),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .select('_id filename fileType createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ documents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({ _id: id, userId: req.userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await Document.deleteOne({ _id: id });

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
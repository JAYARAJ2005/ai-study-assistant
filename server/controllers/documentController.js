const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { YoutubeTranscript } = require('youtube-transcript');
const Document = require('../models/Document');
const { transcribeYoutubeVideo } = require('../services/aiService');

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

// Stops waiting after a set time so a slow request cannot hang the whole flow
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms)
    ),
  ]);
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

    const filename = `YouTube: ${videoId}`;

    // Reuse an earlier result for the same video (skips the slow step)
    const existing = await Document.findOne({
      userId: req.userId,
      fileType: 'youtube',
      filename,
    });
    if (existing) {
      console.log('YouTube: reusing saved transcript for', videoId);
      return res.status(201).json({
        message: 'Video processed successfully',
        documentId: existing._id,
        preview: existing.extractedText.slice(0, 300),
      });
    }

    let extractedText = '';

    // 1) Try the transcript library first (works on localhost), max 8 seconds
    const t1 = Date.now();
    try {
      const transcriptItems = await withTimeout(
        YoutubeTranscript.fetchTranscript(videoId),
        8000
      );
      if (transcriptItems && transcriptItems.length > 0) {
        extractedText = transcriptItems.map((item) => item.text).join(' ');
      }
    } catch (transcriptErr) {
      console.error('YouTube transcript error for', videoId, ':', transcriptErr.message);
    }
    console.log(`YouTube: transcript library step took ${Date.now() - t1} ms`);

    // 2) Fallback: let Gemini read the public video directly
    if (!extractedText.trim()) {
      const t2 = Date.now();
      try {
        extractedText = await transcribeYoutubeVideo(
          `https://www.youtube.com/watch?v=${videoId}`
        );
        console.log(`YouTube: Gemini video step took ${Date.now() - t2} ms`);
      } catch (geminiErr) {
        console.error('Gemini YouTube fallback error for', videoId, ':', geminiErr);
        return res.status(400).json({
          message:
            'Could not read this video. It must be a public video, and very long videos may not work.',
        });
      }
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        message: 'No usable content found for this video.',
      });
    }

    const newDoc = await Document.create({
      userId: req.userId,
      filename,
      fileType: 'youtube',
      extractedText,
    });

    res.status(201).json({
      message: 'Video processed successfully',
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
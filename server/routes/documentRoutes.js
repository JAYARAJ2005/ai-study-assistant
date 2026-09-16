const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadDocument, createFromYoutube, getAllDocuments, deleteDocument } = require('../controllers/documentController');

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);
router.post('/youtube', authMiddleware, createFromYoutube);
router.get('/', authMiddleware, getAllDocuments);
router.delete('/:id', authMiddleware, deleteDocument);

module.exports = router;
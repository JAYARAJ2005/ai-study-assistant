import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import MainLayout from "../layouts/MainLayout/MainLayout";
import HistoryPicker from '../components/HistoryPicker/HistoryPicker';
import { useNotifications } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import '../pages/Dashboard.css';

function Flashcards() {
  usePageTitle('Flashcards');

  const location = useLocation();
  const { addNotification } = useNotifications();
  const plusMenuRef = useRef(null);

  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [documentName, setDocumentName] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFlip = (index) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const resetPanels = () => {
    setShowFileUpload(false);
    setShowYoutubeInput(false);
    setFile(null);
    setYoutubeUrl('');
    setError('');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSelectHistoryItem = async (item) => {
    setError('');
    resetPanels();
    try {
      const res = await api.get(`/api/flashcards/item/${item.id}`);
      setFlashcards(res.data.flashcards.cards);
      setFlippedCards({});
      setDocumentName(res.data.filename);
    } catch (err) {
      setError('Failed to load flashcards from history');
    }
  };

  const generateFlashcardsForDocument = async (documentId, label) => {
    const flashcardsRes = await api.post(`/api/flashcards/${documentId}`, {});
    setFlashcards(flashcardsRes.data.flashcards.cards);
    setFlippedCards({});
    setDocumentName(label);
    setHistoryRefreshKey((k) => k + 1);
    addNotification(`Flashcards generated for "${label}"`);
    resetPanels();
  };

  const handleUploadAndGenerate = async () => {
    if (!file) {
      setError('Please choose a file first');
      return;
    }

    setLoading(true);
    setError('');
    setFlashcards(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await generateFlashcardsForDocument(uploadRes.data.documentId, file.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload or generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeGenerate = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please paste a YouTube video URL');
      return;
    }

    setLoading(true);
    setError('');
    setFlashcards(null);

    try {
      const ytRes = await api.post('/api/documents/youtube', { url: youtubeUrl.trim() });
      await generateFlashcardsForDocument(ytRes.data.documentId, 'YouTube Video');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process YouTube video');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!flashcards || flashcards.length === 0) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const usableWidth = pageWidth - margin * 2;
    let y = 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Flashcards', margin, y);
    y += 26;

    if (documentName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(`Source: ${documentName}`, margin, y);
      y += 24;
    }

    flashcards.forEach((card, i) => {
      const termLines = doc.splitTextToSize(`${i + 1}. ${card.front}`, usableWidth);
      const answerLines = doc.splitTextToSize(card.back, usableWidth - 14);
      const blockHeight = (termLines.length + answerLines.length) * 16 + 24;

      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = 60;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      termLines.forEach((line) => {
        doc.text(line, margin, y);
        y += 16;
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      answerLines.forEach((line) => {
        doc.text(line, margin + 14, y);
        y += 16;
      });

      y += 14;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y - 6, pageWidth - margin, y - 6);
    });

    const fileLabel = documentName ? documentName.replace(/\.[^/.]+$/, '').replace(/[:\s]+/g, '-') : 'flashcards';
    doc.save(`${fileLabel}-flashcards.pdf`);
    addNotification('Flashcards exported as PDF');
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="card">
          <h2 className="card-title">🧠 Flashcards</h2>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <HistoryPicker
              key={historyRefreshKey}
              historyUrl="/api/flashcards/history"
              deleteUrlBase="/api/flashcards/item"
              onSelectItem={handleSelectHistoryItem}
              label="🕘 Past Flashcard Sets"
              initialOpen={location.state?.openHistory}
            />

            <div className="chat-plus-wrapper" ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu((prev) => !prev)}
                className="btn-primary"
                style={{ height: '40px', borderRadius: '9px', width: 'auto', padding: '0 22px' }}
              >
                + New Flashcards
              </button>

              {showPlusMenu && (
                <div className="chat-plus-menu" style={{ bottom: 'auto', top: '48px', left: '0' }}>
                  <div
                    className="chat-plus-menu-item"
                    onClick={() => {
                      resetPanels();
                      setShowFileUpload(true);
                      setShowPlusMenu(false);
                      setFlashcards(null);
                      setFlippedCards({});
                      setDocumentName(null);
                    }}
                  >
                    📄 Upload Document
                  </div>
                  <div
                    className="chat-plus-menu-item"
                    onClick={() => {
                      resetPanels();
                      setShowYoutubeInput(true);
                      setShowPlusMenu(false);
                      setFlashcards(null);
                      setFlippedCards({});
                      setDocumentName(null);
                    }}
                  >
                    🎥 YouTube Video
                  </div>
                </div>
              )}
            </div>
          </div>

          {showFileUpload && (
            <div className="upload-row" style={{ marginTop: '16px' }}>
              <div className="file-input-wrapper">
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
              </div>
              <button onClick={handleUploadAndGenerate} disabled={loading} className="btn-primary">
                {loading ? 'Processing...' : 'Upload & Generate Flashcards'}
              </button>
              <button className="btn-clear" onClick={resetPanels}>Cancel</button>
            </div>
          )}

          {showYoutubeInput && (
            <div className="upload-row" style={{ marginTop: '16px' }}>
              <input
                type="text"
                className="image-prompt-input"
                placeholder="Paste a YouTube video URL..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleYoutubeGenerate(); }}
              />
              <button onClick={handleYoutubeGenerate} disabled={loading} className="btn-primary">
                {loading ? 'Processing...' : 'Fetch & Generate Flashcards'}
              </button>
              <button className="btn-clear" onClick={resetPanels}>Cancel</button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
        </div>

        {loading && (
          <div className="card flashcards-card">
            <div className="fc-skel-grid">
              <div className="fc-skel-card">
                <div className="skel fc-skel-label"></div>
                <div className="skel fc-skel-title"></div>
              </div>
              <div className="fc-skel-card">
                <div className="skel fc-skel-label"></div>
                <div className="skel fc-skel-title"></div>
              </div>
              <div className="fc-skel-card">
                <div className="skel fc-skel-label"></div>
                <div className="skel fc-skel-title"></div>
              </div>
            </div>
          </div>
        )}

        {!loading && flashcards && (
          <div className="card flashcards-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' }}>
              {documentName && (
                <p style={{ color: 'var(--gray)', fontSize: '13px', margin: 0 }}>
                  <strong style={{ color: 'var(--text)' }}>Source:</strong> {documentName}
                </p>
              )}
              <button className="btn-clear" onClick={handleExportPDF} style={{ marginLeft: 'auto' }}>
                📥 Export PDF
              </button>
            </div>
            <p className="flashcards-hint">👆 Click a card to flip it</p>
            {flashcards.map((card, i) => (
              <div key={i} className="flashcard-scene">
                <div
                  className={`flashcard-flip ${flippedCards[i] ? 'flipped' : ''}`}
                  onClick={() => toggleFlip(i)}
                >
                  <div className="flashcard-face flashcard-face-front">
                    <div className="flashcard-label">Term</div>
                    <div className="flashcard-term">{card.front}</div>
                    <span className="flashcard-tap-hint">tap to flip</span>
                  </div>
                  <div className="flashcard-face flashcard-face-back">
                    <div className="flashcard-label">Answer</div>
                    <div className="flashcard-answer">{card.back}</div>
                    <span className="flashcard-tap-hint">tap to flip</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Flashcards;
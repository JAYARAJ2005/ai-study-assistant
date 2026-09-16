import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import MainLayout from "../layouts/MainLayout/MainLayout";
import HistoryPicker from '../components/HistoryPicker/HistoryPicker';
import { useNotifications } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import './Dashboard.css';

function Summary() {
  usePageTitle('Summary');

  const location = useLocation();
  const { addNotification } = useNotifications();
  const plusMenuRef = useRef(null);

  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [documentName, setDocumentName] = useState(null);
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
      const res = await api.get(`/api/summary/item/${item.id}`);
      setSummary(res.data.summary.content);
      setDocumentName(res.data.filename);
    } catch (err) {
      setError('Failed to load summary from history');
    }
  };

  const generateSummaryForDocument = async (documentId, label) => {
    const summaryRes = await api.post(`/api/summary/${documentId}`, {});
    setSummary(summaryRes.data.summary.content);
    setDocumentName(label);
    setHistoryRefreshKey((k) => k + 1);
    addNotification(`Summary generated for "${label}"`);
    resetPanels();
  };

  const handleUploadAndGenerate = async () => {
    if (!file) {
      setError('Please choose a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await generateSummaryForDocument(uploadRes.data.documentId, file.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload or generate summary');
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
    setSummary(null);

    try {
      const ytRes = await api.post('/api/documents/youtube', { url: youtubeUrl.trim() });
      await generateSummaryForDocument(ytRes.data.documentId, 'YouTube Video');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process YouTube video');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!summary) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 50;
    const usableWidth = pageWidth - margin * 2;
    let y = 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Summary', margin, y);
    y += 26;

    if (documentName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(`Source: ${documentName}`, margin, y);
      y += 24;
    }

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const plainText = summary
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/`/g, '');

    const lines = doc.splitTextToSize(plainText, usableWidth);
    const lineHeight = 16;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    const fileLabel = documentName ? documentName.replace(/\.[^/.]+$/, '').replace(/[:\s]+/g, '-') : 'summary';
    doc.save(`${fileLabel}-summary.pdf`);
    addNotification('Summary exported as PDF');
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="card">
          <h2 className="card-title">📝 Summary</h2>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <HistoryPicker
              key={historyRefreshKey}
              historyUrl="/api/summary/history"
              deleteUrlBase="/api/summary/item"
              onSelectItem={handleSelectHistoryItem}
              label="🕘 Past Summaries"
              initialOpen={location.state?.openHistory}
            />

            <div className="chat-plus-wrapper" ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu((prev) => !prev)}
                className="btn-primary"
                style={{ height: '40px', borderRadius: '9px', width: 'auto', padding: '0 22px' }}
              >
                + New Summary
              </button>

              {showPlusMenu && (
                <div className="chat-plus-menu" style={{ bottom: 'auto', top: '48px', left: '0' }}>
                  <div
                    className="chat-plus-menu-item"
                    onClick={() => {
                      resetPanels();
                      setShowFileUpload(true);
                      setShowPlusMenu(false);
                      setSummary(null);
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
                      setSummary(null);
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
                {loading ? 'Processing...' : 'Upload & Generate Summary'}
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
                {loading ? 'Processing...' : 'Fetch & Generate Summary'}
              </button>
              <button className="btn-clear" onClick={resetPanels}>Cancel</button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
        </div>

        {loading && (
          <div className="card summary-card">
            <div className="skel skel-line w100"></div>
            <div className="skel skel-line w95"></div>
            <div className="skel skel-line w88"></div>
            <div className="skel skel-line w100"></div>
            <div className="skel skel-line w70"></div>
            <div className="skel skel-line w60"></div>
          </div>
        )}

        {!loading && summary && (
          <div className="card summary-card markdown-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              {documentName && (
                <p style={{ color: 'var(--gray)', fontSize: '13px', margin: 0 }}>
                  <strong style={{ color: 'var(--text)' }}>Source:</strong> {documentName}
                </p>
              )}
              <button className="btn-clear" onClick={handleExportPDF} style={{ marginLeft: 'auto' }}>
                📥 Export PDF
              </button>
            </div>
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Summary;
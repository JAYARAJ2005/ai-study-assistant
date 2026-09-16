import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import MainLayout from "../layouts/MainLayout/MainLayout";
import HistoryPicker from '../components/HistoryPicker/HistoryPicker';
import { useNotifications } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import './Dashboard.css';

function Quiz() {
  usePageTitle('Quiz');

  const location = useLocation();
  const { addNotification } = useNotifications();
  const plusMenuRef = useRef(null);

  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [documentName, setDocumentName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Interactive quiz-taking state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetQuizState = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setVisibleIndices(null);
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
    resetQuizState();
    try {
      const res = await api.get(`/api/quiz/item/${item.id}`);
      setQuiz(res.data.quiz.questions);
      setDocumentName(res.data.filename);
    } catch (err) {
      setError('Failed to load quiz from history');
    }
  };

  const generateQuizForDocument = async (documentId, label) => {
    const quizRes = await api.post(`/api/quiz/${documentId}`, {});
    setQuiz(quizRes.data.quiz.questions);
    setDocumentName(label);
    setHistoryRefreshKey((k) => k + 1);
    addNotification(`Quiz generated for "${label}"`);
    resetPanels();
  };

  const handleUploadAndGenerate = async () => {
    if (!file) {
      setError('Please choose a file first');
      return;
    }

    setLoading(true);
    setError('');
    setQuiz(null);
    resetQuizState();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await generateQuizForDocument(uploadRes.data.documentId, file.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload or generate quiz');
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
    setQuiz(null);
    resetQuizState();

    try {
      const ytRes = await api.post('/api/documents/youtube', { url: youtubeUrl.trim() });
      await generateQuizForDocument(ytRes.data.documentId, 'YouTube Video');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process YouTube video');
    } finally {
      setLoading(false);
    }
  };

  const currentIndices = visibleIndices || (quiz ? quiz.map((_, i) => i) : []);
  const answeredCount = currentIndices.filter((i) => selectedAnswers[i] !== undefined).length;
  const allAnswered = quiz && currentIndices.length > 0 && answeredCount === currentIndices.length;

  const handleSelectOption = (qIndex, option) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitQuiz = () => {
    if (!allAnswered) return;
    setSubmitted(true);
  };

  const score = submitted
    ? currentIndices.filter((i) => selectedAnswers[i] === quiz[i].correctAnswer).length
    : 0;

  const wrongIndices = submitted
    ? currentIndices.filter((i) => selectedAnswers[i] !== quiz[i].correctAnswer)
    : [];

  const handleRetryWrong = () => {
    setVisibleIndices(wrongIndices);
    setSubmitted(false);
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      wrongIndices.forEach((i) => delete next[i]);
      return next;
    });
  };

  const handleRetakeAll = () => {
    resetQuizState();
  };

  const handleExportPDF = () => {
    if (!quiz || quiz.length === 0) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const usableWidth = pageWidth - margin * 2;
    let y = 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Quiz', margin, y);
    y += 26;

    if (documentName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(`Source: ${documentName}`, margin, y);
      y += 24;
    }

    quiz.forEach((q, i) => {
      const questionLines = doc.splitTextToSize(`${i + 1}. ${q.question}`, usableWidth);
      const optionHeights = q.options.length * 16;
      const blockHeight = questionLines.length * 16 + optionHeights + 20;

      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = 60;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      questionLines.forEach((line) => {
        doc.text(line, margin, y);
        y += 16;
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      q.options.forEach((opt, j) => {
        const isCorrect = opt === q.correctAnswer;
        const letter = String.fromCharCode(65 + j);
        const optionLines = doc.splitTextToSize(`${letter}. ${opt}${isCorrect ? '  (Correct)' : ''}`, usableWidth - 14);

        if (isCorrect) {
          doc.setTextColor(20, 130, 90);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(70, 70, 70);
          doc.setFont('helvetica', 'normal');
        }

        optionLines.forEach((line) => {
          doc.text(line, margin + 14, y);
          y += 16;
        });
      });

      y += 12;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y - 6, pageWidth - margin, y - 6);
    });

    const fileLabel = documentName ? documentName.replace(/\.[^/.]+$/, '').replace(/[:\s]+/g, '-') : 'quiz';
    doc.save(`${fileLabel}-quiz.pdf`);
    addNotification('Quiz exported as PDF');
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="card">
          <h2 className="card-title">❓ Quiz</h2>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <HistoryPicker
              key={historyRefreshKey}
              historyUrl="/api/quiz/history"
              deleteUrlBase="/api/quiz/item"
              onSelectItem={handleSelectHistoryItem}
              label="🕘 Past Quizzes"
              initialOpen={location.state?.openHistory}
            />

            <div className="chat-plus-wrapper" ref={plusMenuRef}>
              <button
                onClick={() => setShowPlusMenu((prev) => !prev)}
                className="btn-primary"
                style={{ height: '40px', borderRadius: '9px', width: 'auto', padding: '0 22px' }}
              >
                + New Quiz
              </button>

              {showPlusMenu && (
                <div className="chat-plus-menu" style={{ bottom: 'auto', top: '48px', left: '0' }}>
                  <div
                    className="chat-plus-menu-item"
                    onClick={() => {
                      resetPanels();
                      setShowFileUpload(true);
                      setShowPlusMenu(false);
                      setQuiz(null);
                      setDocumentName(null);
                      resetQuizState();
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
                      setQuiz(null);
                      setDocumentName(null);
                      resetQuizState();
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
                {loading ? 'Processing...' : 'Upload & Generate Quiz'}
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
                {loading ? 'Processing...' : 'Fetch & Generate Quiz'}
              </button>
              <button className="btn-clear" onClick={resetPanels}>Cancel</button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
        </div>

        {loading && (
          <div className="card quiz-card">
            <div className="quiz-skel-q">
              <div className="skel skel-line w95"></div>
              <div className="quiz-skel-opts">
                <div className="skel quiz-skel-opt"></div>
                <div className="skel quiz-skel-opt"></div>
                <div className="skel quiz-skel-opt"></div>
                <div className="skel quiz-skel-opt"></div>
              </div>
            </div>
            <div className="quiz-skel-q">
              <div className="skel skel-line w88"></div>
              <div className="quiz-skel-opts">
                <div className="skel quiz-skel-opt"></div>
                <div className="skel quiz-skel-opt"></div>
                <div className="skel quiz-skel-opt"></div>
                <div className="skel quiz-skel-opt"></div>
              </div>
            </div>
          </div>
        )}

        {!loading && quiz && (
          <div className="card quiz-card">
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

            {submitted && (
              <div className="quiz-score-banner">
                <div className="quiz-score-text">
                  You scored <strong>{score}</strong> / {currentIndices.length}
                  {visibleIndices && <span className="quiz-score-tag"> (retry round)</span>}
                </div>
                <div className="quiz-score-actions">
                  {wrongIndices.length > 0 && (
                    <button className="btn-primary" onClick={handleRetryWrong}>
                      🔁 Retry {wrongIndices.length} Incorrect
                    </button>
                  )}
                  <button className="btn-clear" onClick={handleRetakeAll}>
                    Retake Full Quiz
                  </button>
                </div>
              </div>
            )}

            {currentIndices.map((i) => {
              const q = quiz[i];
              const chosen = selectedAnswers[i];
              return (
                <div key={i} className="quiz-question">
                  <p>{i + 1}. {q.question}</p>
                  <ul>
                    {q.options.map((opt, j) => {
                      let optionClass = '';
                      if (submitted) {
                        if (opt === q.correctAnswer) optionClass = 'correct';
                        else if (opt === chosen) optionClass = 'incorrect';
                      } else if (opt === chosen) {
                        optionClass = 'selected';
                      }

                      return (
                        <li
                          key={j}
                          className={`${optionClass} ${!submitted ? 'selectable' : ''}`}
                          onClick={() => handleSelectOption(i, opt)}
                        >
                          <strong>{String.fromCharCode(65 + j)}.</strong> {opt}
                          {submitted && opt === q.correctAnswer && ' ✅'}
                          {submitted && optionClass === 'incorrect' && ' ❌'}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {!submitted && (
              <div className="btn-group">
                <button
                  className="btn-primary"
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                >
                  {allAnswered ? 'Submit Quiz' : `Answer all questions (${answeredCount}/${currentIndices.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Quiz;
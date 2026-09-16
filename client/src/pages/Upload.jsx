import { useState } from 'react';
import axios from 'axios';
import MainLayout from "../layouts/MainLayout/MainLayout";
import DocumentPicker from '../components/DocumentPicker/DocumentPicker';
import './Dashboard.css';

function Upload() {
  const token = localStorage.getItem('token');

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setDocument(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setDocument({
        id: res.data.documentId,
        filename: file.name,
        preview: res.data.preview,
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPastDocument = (doc) => {
    if (!doc) return;
    setFile(null);
    setError('');
    setDocument({
      id: doc.id,
      filename: doc.filename,
      preview: null,
    });
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="card">
          <h2 className="card-title">📄 Upload a Study Document</h2>

          <div className="upload-row" style={{ alignItems: 'flex-start' }}>
            <div className="file-input-wrapper">
              <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
            </div>
            <button onClick={handleUpload} disabled={uploading} className="btn-primary">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>

            <div style={{ minWidth: '220px' }}>
              <DocumentPicker
                key={refreshKey}
                selectedDocId={document?.id}
                selectedFilename={null}
                onSelect={handleSelectPastDocument}
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          {document && (
            <div className="card upload-success" style={{ marginTop: '20px', marginBottom: 0 }}>
              <div className="upload-success-header">✅ Selected: {document.filename}</div>
              {document.preview && (
                <p className="preview-text"><strong>Preview:</strong> {document.preview}</p>
              )}
              <p style={{ color: 'var(--gray)', fontSize: '13.5px', marginTop: '10px' }}>
                Now go to Summary, Quiz, Flashcards, or AI Chat to work with this document.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Upload;
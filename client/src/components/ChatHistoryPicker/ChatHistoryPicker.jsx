import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './ChatHistoryPicker.css';

function ChatHistoryPicker({ onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const wrapperRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/chat/sessions');
      setSessions(res.data.sessions);
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePick = (session) => {
    onSelectSession(session);
    setIsOpen(false);
  };

  const handleDelete = async (e, session) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat? This cannot be undone.')) return;

    setDeletingId(session.id);
    try {
      await api.delete(`/api/chat/session/${session.type}/${session.id}`);
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch (err) {
      alert('Failed to delete chat');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="chat-history-wrapper" ref={wrapperRef}>
      <button type="button" className="chat-history-toggle" onClick={() => setIsOpen((p) => !p)}>
        <span>🕘 Chat History</span>
        <span className={`chat-history-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="chat-history-list">
          {loading && <p className="chat-history-empty">Loading...</p>}
          {!loading && sessions.length === 0 && (
            <p className="chat-history-empty">No past conversations yet</p>
          )}
          {!loading && sessions.map((s, i) => (
            <div key={i} className="chat-history-item" onClick={() => handlePick(s)}>
              <div className="chat-history-item-content">
                <div className="chat-history-item-title">{s.filename}</div>
                <div className="chat-history-item-preview">{s.lastMessage}</div>
              </div>
              <button
                className="chat-history-delete"
                onClick={(e) => handleDelete(e, s)}
                disabled={deletingId === s.id}
                title="Delete chat"
              >
                {deletingId === s.id ? '...' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatHistoryPicker;
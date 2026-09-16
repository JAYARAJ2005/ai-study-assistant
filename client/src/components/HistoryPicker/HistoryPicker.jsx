import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './HistoryPicker.css';

function HistoryPicker({ historyUrl, deleteUrlBase, onSelectItem, label = '🕘 History', initialOpen = false }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const wrapperRef = useRef(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(historyUrl);
      setItems(res.data.history);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [historyUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePick = (item) => {
    onSelectItem(item);
    setIsOpen(false);
  };

  const handleDelete = async (e, itemId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this item? This cannot be undone.')) return;

    setDeletingId(itemId);
    try {
      await api.delete(`${deleteUrlBase}/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="history-picker-wrapper" ref={wrapperRef}>
      <button type="button" className="history-picker-toggle" onClick={() => setIsOpen((p) => !p)}>
        <span>{label}</span>
        <span className={`history-picker-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="history-picker-list">
          {loading && <p className="history-picker-empty">Loading...</p>}
          {!loading && items.length === 0 && (
            <p className="history-picker-empty">No history yet</p>
          )}
          {!loading && items.map((item) => (
            <div key={item.id} className="history-picker-item" onClick={() => handlePick(item)}>
              <div className="history-picker-item-content">
                <div className="history-picker-item-title">{item.filename}</div>
                <div className="history-picker-item-preview">{item.preview}</div>
                <div className="history-picker-item-date">{new Date(item.createdAt).toLocaleDateString()}</div>
              </div>
              <button
                className="history-picker-delete"
                onClick={(e) => handleDelete(e, item.id)}
                disabled={deletingId === item.id}
                title="Delete"
              >
                {deletingId === item.id ? '...' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPicker;
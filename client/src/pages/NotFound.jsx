import { Link } from 'react-router-dom';
import './Legal.css';

function NotFound() {
  return (
    <div className="legal-page">
      <div className="legal-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '52px', marginBottom: '10px' }}>🧭</div>
        <h1 className="legal-title">404 — Page Not Found</h1>
        <p style={{ color: '#9CA3C9', fontSize: '14.5px', margin: '10px 0 28px' }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
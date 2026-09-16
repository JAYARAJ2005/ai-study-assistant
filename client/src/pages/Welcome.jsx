import { Link } from 'react-router-dom';
import logo from "../assets/logo/logo.png";
import './Welcome.css';

function Welcome() {
  return (
    <div className="welcome-page">
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <div className="stage">
        <div className="stage-logo">
          <div className="logo-ring" title="Hover me">
            <img
              className="logo-icon"
              src={logo}
              alt="AI Study Assistant"
            />
          </div>
        </div>

        <p className="tagline">
          Summaries, flashcards, quizzes, and an AI chat — all built from what you actually study.
        </p>

        <div className="badge-row">
          <span className="dot"></span>
          <span>Study smarter with AI</span>
        </div>

        <div className="btn-row">
          <Link to="/login" className="btn btn-ghost">
            Log In
          </Link>

          <Link to="/register" className="btn btn-register">
            Register
          </Link>
        </div>

        <p className="fineprint">
  By continuing you agree to our{' '}
  <Link to="/terms">Terms</Link> &amp;{' '}
  <Link to="/privacy">Privacy Policy</Link>
</p>
      </div>
    </div>
  );
}

export default Welcome;
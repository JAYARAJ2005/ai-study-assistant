import { Link } from 'react-router-dom';
import './Legal.css';

function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <Link to="/" className="legal-back-btn">← Back</Link>

        <h1 className="legal-title">Terms & Conditions</h1>
        <p className="legal-updated">Last updated: September 2026</p>

        <div className="legal-content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using AI Study Assistant ("the App"), you agree to be bound by these
            Terms & Conditions. If you do not agree, please do not use the App.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            AI Study Assistant provides AI-generated summaries, quizzes, flashcards, and chat-based
            assistance based on documents you upload or questions you ask. Content is generated using
            third-party AI models and is provided for study and educational purposes only.
          </p>

          <h2>3. Accuracy of AI-Generated Content</h2>
          <p>
            While we aim to provide helpful and accurate study materials, AI-generated content may
            contain errors, omissions, or inaccuracies. You should independently verify important
            information before relying on it for exams, assignments, or academic decisions.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>
            You are responsible for the documents and content you upload. Do not upload material you
            do not have the right to use, or content that is unlawful, harmful, or violates any
            third-party rights.
          </p>

          <h2>5. Account & Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            The App is provided "as is" without warranties of any kind. We are not liable for any
            damages resulting from your use of the App or reliance on AI-generated content.
          </p>

          <h2>7. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the App after changes are
            posted constitutes acceptance of the revised Terms.
          </p>

          <h2>8. Contact</h2>
<p>
  If you have questions about these Terms, please contact us at{' '}
  <a href="mailto:studyaisupport2026@gmail.com" className="legal-link">
    studyaisupport2026@gmail.com
  </a>.
</p>
        </div>
      </div>
    </div>
  );
}

export default Terms;
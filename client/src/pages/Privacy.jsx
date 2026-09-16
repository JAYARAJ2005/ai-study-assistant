import { Link } from 'react-router-dom';
import './Legal.css';

function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <Link to="/" className="legal-back-btn">← Back</Link>

        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: September 2026</p>

        <div className="legal-content">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name and email when you register,
            along with documents you upload and questions you ask the AI Study Assistant.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used to provide core app features: generating summaries, quizzes,
            flashcards, and chat responses, as well as maintaining your account and chat history.
          </p>

          <h2>3. Third-Party AI Processing</h2>
          <p>
            Uploaded documents and chat messages are sent to a third-party AI provider (Google's
            Gemini API) to generate responses. Please avoid uploading highly sensitive personal
            information you would not want processed by an external AI service.
          </p>

          <h2>4. Data Storage</h2>
          <p>
            Your account details, uploaded document text, and chat history are stored securely in our
            database to let you access your past summaries, quizzes, and conversations.
          </p>

          <h2>5. Data Sharing</h2>
          <p>
            We do not sell your personal data. Information is only shared with the AI service provider
            as necessary to generate the content you request.
          </p>

          <h2>6. Your Choices</h2>
          <p>
            You can delete individual chats, summaries, quizzes, or flashcard sets from your history at
            any time within the app.
          </p>

          <h2>7. Security</h2>
          <p>
            We take reasonable measures to protect your data, but no method of transmission or storage
            is 100% secure.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of the App after changes
            constitutes acceptance of the revised policy.
          </p>

          <h2>9. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:studyaisupport2026@gmail.com" className="legal-link">
              studyaisupport2026@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
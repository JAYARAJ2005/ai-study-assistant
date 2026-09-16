import './WelcomeCard.css';

function WelcomeCard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const name = user?.name || 'there';

  return (
    <div className="welcome-card">
      <div className="welcome-card-pattern"></div>

      <div className="welcome-text">
        <h1>👋 Welcome back, <span>{name}</span></h1>
        <p>Continue your learning journey with AI-powered study tools.</p>
      </div>

      <div className="welcome-image">
        <div className="welcome-image-badge">🎓</div>
      </div>
    </div>
  );
}

export default WelcomeCard;
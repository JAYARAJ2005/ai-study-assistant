import MainLayout from "../layouts/MainLayout/MainLayout";
import usePageTitle from "../hooks/usePageTitle";
import './Dashboard.css';

function Profile() {
  usePageTitle('Profile');

  const user = JSON.parse(localStorage.getItem('user'));

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="card profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-name">{user?.name || 'Unknown user'}</div>
          <div className="profile-email">{user?.email || '—'}</div>

          <div className="profile-details">
            <div className="profile-field">
              <span className="profile-field-label">Full name</span>
              <span className="profile-field-value">{user?.name || '—'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Email address</span>
              <span className="profile-field-value">{user?.email || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;
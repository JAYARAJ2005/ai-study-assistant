import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import logo from "../../assets/logo/logo.png";
import { FaBars } from "react-icons/fa";
import "./Navbar.css";

const SEARCH_PAGES = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Summary", path: "/summary" },
  { name: "Quiz", path: "/quiz" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "AI Chat", path: "/chat" },
  { name: "Profile", path: "/profile" },
];

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { notifications, markAllRead, unreadCount } = useNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filteredPages = SEARCH_PAGES.filter((page) =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goToPage = (path) => {
    navigate(path);
    setSearchTerm("");
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => {
      const next = !prev;
      if (next) markAllRead();
      return next;
    });
    setShowProfileMenu(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuClick}>
          <FaBars />
        </button>
        <img src={logo} alt="Logo" className="navbar-logo" />
        <h2>AI Study Assistant</h2>
      </div>

      <div className="navbar-right">
        <div className="search-wrapper" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search..."
            className="search-box"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
          />

          {showSearchResults && searchTerm && (
            <div className="search-dropdown">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <div
                    key={page.path}
                    className="search-dropdown-item"
                    onClick={() => goToPage(page.path)}
                  >
                    {page.name}
                  </div>
                ))
              ) : (
                <div className="search-dropdown-item search-dropdown-empty">
                  No matching page
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button className="notification-btn" onClick={toggleNotifications}>
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notification-dropdown">
              {notifications.length === 0 ? (
                <div className="dropdown-item dropdown-empty">
                  No new notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-time">{timeAgo(n.time)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="user-profile"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotifications(false);
            }}
          >
            👤
          </div>

          {showProfileMenu && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => {
                  navigate("/profile");
                  setShowProfileMenu(false);
                }}
              >
                Profile
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
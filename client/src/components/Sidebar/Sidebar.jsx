import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaFileAlt,
  FaQuestionCircle,
  FaLayerGroup,
  FaRobot,
  FaUser,
  FaSignOutAlt,
  FaGraduationCap,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

      <button className="sidebar-close-btn" onClick={onClose}>
        <FaTimes />
      </button>

      <div className="sidebar-logo">
        <FaGraduationCap className="sidebar-logo-icon" />
        <h2>StudyAI</h2>
      </div>

      <button className="sidebar-back-button" onClick={handleBack}>
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <nav className="sidebar-menu">

        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          <FaHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/summary" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          <FaFileAlt />
          <span>Summary</span>
        </NavLink>

        <NavLink to="/quiz" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          <FaQuestionCircle />
          <span>Quiz</span>
        </NavLink>

        <NavLink to="/flashcards" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          <FaLayerGroup />
          <span>Flashcards</span>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          <FaRobot />
          <span>AI Chat</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')} onClick={handleLinkClick}>
          <FaUser />
          <span>Profile</span>
        </NavLink>

      </nav>

      <button className="logout-button" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>

    </aside>
  );
}

export default Sidebar;
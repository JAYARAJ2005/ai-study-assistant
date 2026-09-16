import "./QuickActions.css";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaQuestionCircle,
  FaLayerGroup,
  FaRobot,
} from "react-icons/fa";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Generate Summary",
      icon: <FaFileAlt />,
      path: "/summary",
    },
    {
      title: "Create Quiz",
      icon: <FaQuestionCircle />,
      path: "/quiz",
    },
    {
      title: "Flashcards",
      icon: <FaLayerGroup />,
      path: "/flashcards",
    },
    {
      title: "AI Chat",
      icon: <FaRobot />,
      path: "/chat",
    },
  ];

  return (
    <div className="quick-actions">
      <h2>⚡ Quick Actions</h2>

      <div className="action-grid">
        {actions.map((action, index) => (
          <button
            className="action-card"
            key={index}
            onClick={() => navigate(action.path)}
          >
            <div className="action-icon">
              {action.icon}
            </div>

            <p>{action.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
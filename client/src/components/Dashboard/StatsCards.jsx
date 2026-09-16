import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./StatsCards.css";
import {
  FaClipboardList,
  FaQuestionCircle,
  FaLayerGroup,
} from "react-icons/fa";

function StatsCards() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    notes: 0,
    summaries: 0,
    quizzes: 0,
    flashcards: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/stats");
        setCounts(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: "Summaries", value: counts.summaries, icon: <FaClipboardList />, path: "/summary" },
    { title: "Quizzes", value: counts.quizzes, icon: <FaQuestionCircle />, path: "/quiz" },
    { title: "Flashcards", value: counts.flashcards, icon: <FaLayerGroup />, path: "/flashcards" },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <div
          className="stat-card"
          key={index}
          onClick={() => navigate(item.path, { state: { openHistory: true } })}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">{item.icon}</div>
          <div className="stat-info">
            <h2>{item.value}</h2>
            <p>{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
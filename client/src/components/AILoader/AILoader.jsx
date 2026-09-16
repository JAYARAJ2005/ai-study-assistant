import "./AILoader.css";
import { FaRobot } from "react-icons/fa";

function AILoader({
  title = "AI is working...",
  subtitle = "Please wait while AI processes your request.",
}) {
  return (
    <div className="ai-loader">

      <div className="robot-circle">
        <FaRobot />
      </div>

      <div className="spinner-ring"></div>

      <h3>{title}</h3>

      <p>{subtitle}</p>

      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>

    </div>
  );
}

export default AILoader;
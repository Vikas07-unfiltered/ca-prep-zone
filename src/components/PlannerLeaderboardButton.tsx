import React from "react";
import { Link } from "react-router-dom";

const PlannerLeaderboardButton: React.FC = () => (
  <div className="flex justify-end mb-6">
    <Link
      to="/leaderboard"
      className="inline-block px-5 py-2 rounded bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition-colors"
      style={{ textDecoration: 'none' }}
    >
      🏆 View Leaderboard
    </Link>
  </div>
);

export default PlannerLeaderboardButton;

import React from "react";

const Leaderboard = () => {
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left font-semibold">Rank</th>
              <th className="py-2 px-4 text-left font-semibold">User</th>
              <th className="py-2 px-4 text-left font-semibold">Streak</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="py-2 px-4">1</td>
              <td className="py-2 px-4">🧑‍🎓 You</td>
              <td className="py-2 px-4">0 days</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;

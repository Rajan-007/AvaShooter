import { useState } from 'react';
import { FaTimes, FaTrophy, FaSkull, FaGamepad, FaMedal } from 'react-icons/fa';

interface LeaderboardPopupProps {
  showLeaderboard: boolean;
  setShowLeaderboard: (value: boolean) => void;
}

export default function LeaderboardPopup({ showLeaderboard, setShowLeaderboard }: LeaderboardPopupProps) {
  // Sample leaderboard data - replace with your actual data source
  const [leaderboardData] = useState([
    { id: 1, name: "NinjaWarrior", highestScore: 12500, highestKills: 32, gamesPlayed: 145 },
    { id: 2, name: "ShadowHunter", highestScore: 11200, highestKills: 28, gamesPlayed: 97 },
    { id: 3, name: "PhantomArcher", highestScore: 10800, highestKills: 26, gamesPlayed: 112 },
    { id: 4, name: "DragonSlayer", highestScore: 9750, highestKills: 24, gamesPlayed: 89 },
    { id: 5, name: "StealthAssassin", highestScore: 9400, highestKills: 22, gamesPlayed: 76 },
    { id: 6, name: "MysticMage", highestScore: 8950, highestKills: 20, gamesPlayed: 103 },
    { id: 7, name: "ThunderBolt", highestScore: 8200, highestKills: 19, gamesPlayed: 85 },
    { id: 8, name: "GhostRider", highestScore: 7800, highestKills: 18, gamesPlayed: 92 },
    { id: 9, name: "DarkKnight", highestScore: 7400, highestKills: 17, gamesPlayed: 68 },
    { id: 10, name: "FrostWizard", highestScore: 6900, highestKills: 16, gamesPlayed: 74 }
  ]);

  // Filter options for leaderboard
  const [sortBy, setSortBy] = useState<"highestScore" | "highestKills" | "gamesPlayed">("highestScore");
  
  const getSortedData = () => {
    return [...leaderboardData].sort((a, b) => b[sortBy] - a[sortBy]);
  };
  
  if (!showLeaderboard) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl px-6 py-10">
       {/* Close Button */}
       <button
          className="absolute top-12 right-4 text-yellow-400 hover:text-white transition-colors duration-200 hover:cursor-pointer"
          onClick={() => setShowLeaderboard(false)}
        >
          <FaTimes className="h-6 w-6" />
        </button>

        {/* Leaderboard Title */}
        <div className="flex justify-center mb-5">
          <div className="bg-yellow-400 text-black font-bold text-3xl px-8 py-3 rounded transform -rotate-1 shadow-lg">
            LEADERBOARD
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setSortBy("highestScore")}
            className={`px-5 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:cursor-pointer ${
              sortBy === "highestScore" 
                ? "bg-yellow-400 text-black" 
                : "bg-black text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            <FaTrophy /> Highest Score
          </button>
          <button
            onClick={() => setSortBy("highestKills")}
            className={`px-5 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:cursor-pointer ${
              sortBy === "highestKills" 
                ? "bg-yellow-400 text-black" 
                : "bg-black text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            <FaSkull /> Highest Kills
          </button>
          <button
            onClick={() => setSortBy("gamesPlayed")}
            className={`px-5 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:cursor-pointer ${
              sortBy === "gamesPlayed" 
                ? "bg-yellow-400 text-black" 
                : "bg-black text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            <FaGamepad /> Games Played
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-black bg-opacity-70 border-2 border-yellow-400 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 text-yellow-400 font-bold text-lg border-b-2 border-yellow-400">
            <div className="py-4 pl-6">Rank</div>
            <div className="py-4 pl-4">Name</div>
            <div className="py-4 px-4 text-center flex items-center justify-center gap-2">
              <FaTrophy className="text-yellow-300" /> Score
            </div>
            <div className="py-4 px-4 text-center flex items-center justify-center gap-2">
              <FaSkull className="text-yellow-300" /> Kills
            </div>
            <div className="py-4 px-4 text-center flex items-center justify-center gap-2">
              <FaGamepad className="text-yellow-300" /> Games
            </div>
          </div>
          
          {/* Table Body */}
          <div className="max-h-96 overflow-y-auto">
            {getSortedData().map((player, index) => (
              <div 
                key={player.id} 
                className={`grid grid-cols-5 text-white text-lg border-b border-yellow-400/30 ${
                  index < 3 ? "bg-yellow-400/10" : ""
                }`}
              >
                <div className="py-4 pl-6 flex items-center">
                  {index === 0 && <FaMedal className="text-yellow-400 text-2xl" />}
                  {index === 1 && <FaMedal className="text-gray-300 text-2xl" />}
                  {index === 2 && <FaMedal className="text-yellow-700 text-2xl" />}
                  {index > 2 && <span className="font-bold text-xl ml-1">{index + 1}</span>}
                </div>
                <div className="py-4 pl-4 font-bold text-yellow-300">
                  {player.name}
                </div>
                <div className="py-4 px-4 text-center">
                  {player.highestScore.toLocaleString()}
                </div>
                <div className="py-4 px-4 text-center">
                  {player.highestKills}
                </div>
                <div className="py-4 px-4 text-center">
                  {player.gamesPlayed}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Player's Position (Optional) */}
        <div className="mt-8 bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-4">
          <h3 className="text-yellow-400 font-bold text-xl mb-2">Your Position</h3>
          <div className="grid grid-cols-5 text-white text-lg">
            <div className="py-2 pl-6">24</div>
            <div className="py-2 pl-4 font-bold text-yellow-300">YourName</div>
            <div className="py-2 px-4 text-center">5,280</div>
            <div className="py-2 px-4 text-center">12</div>
            <div className="py-2 px-4 text-center">31</div>
          </div>
        </div>
      </div>
    </div>
  );
}
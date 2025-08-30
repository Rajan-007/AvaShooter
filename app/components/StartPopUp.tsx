import { useState } from 'react';
import Image from 'next/image';

import Close from '../assets/button-cancel.svg';

interface StartPopupProps {
  showStartPopup: boolean;
  setShowStartPopup: (value: boolean) => void;
}

export default function StartPopup({ showStartPopup, setShowStartPopup }: StartPopupProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    alert(`Joining room "${roomId}" as "${playerName}"`);
  };

  const handleCreateRoom = () => {
    alert(`Creating room with player "${playerName}"`);
  };

  if (!showStartPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>
      
      {/* Modal Window */}
      <div className="relative z-50 bg-[#2D334A] border-2 border-white rounded-3xl w-full max-w-2xl overflow-hidden">
        {/* Header with title and close button */}
        <div className="p-3 relative flex items-center justify-center border-b border-white">
          <h1 className="text-3xl font-bold text-white text-center tracking-wider"
              style={{ 
                textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
              }}>
            SQUAD SETUP
          </h1>
          
          <button 
            className="absolute -top-3 -right-3 hover:cursor-pointer"
            onClick={() => setShowStartPopup(false)}
          >
            <Image src={Close} alt="Close" width={32} height={32} />
          </button>
        </div>
        
        {/* Form content */}
        <div className="p-8 flex flex-col gap-6">
          {/* Player name field */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-2xl font-bold tracking-wider pl-1"
                  style={{ 
                    textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                  }}>
              Player name
            </label>
            <input
              type="text"
              placeholder="eg. Deepakexe"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-700 text-lg border-2 border-gray-300 focus:outline-none"
            />
          </div>
          
          {/* Room ID field */}
          <div className="flex flex-col gap-1">
            <label className="text-white text-2xl font-bold tracking-wider pl-1"
                  style={{ 
                    textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                  }}>
              Room ID
            </label>
            <input
              type="text"
              placeholder="eg. 324225"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-700 text-lg border-2 border-gray-300 focus:outline-none"
            />
          </div>
          
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            <button
              onClick={handleJoinRoom}
              className="relative py-3 flex items-center justify-center"
              style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.5))" }}
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-lg border-b-4 border-yellow-600"></div>
              <span className="relative z-10 text-xl font-bold tracking-wider"
                   style={{ 
                     textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                   }}>
                Join Room
              </span>
            </button>
            
            <button
              onClick={handleCreateRoom}
              className="relative py-3 flex items-center justify-center"
              style={{ filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.5))" }}
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-lg border-b-4 border-yellow-600"></div>
              <span className="relative z-10 text-xl font-bold tracking-wider"
                   style={{ 
                     textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                   }}>
                Create Room
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
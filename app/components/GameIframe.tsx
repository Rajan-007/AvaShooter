'use client';

import { useState, useEffect } from 'react';

interface GameIframeProps {
  roomId: string;
  onClose: () => void;
}

export default function GameIframe({ roomId, onClose }: GameIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          setIsLoading(false);
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-4xl font-bold text-white mb-2">Loading Game</h1>
            <p className="text-gray-400 text-lg">Room: {roomId}</p>
          </div>
          
          <div className="w-80 bg-gray-800 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <p className="text-gray-400">
            {loadingProgress < 30 && "Initializing game server..."}
            {loadingProgress >= 30 && loadingProgress < 60 && "Loading game assets..."}
            {loadingProgress >= 60 && loadingProgress < 90 && "Connecting to room..."}
            {loadingProgress >= 90 && "Almost ready..."}
          </p>
          
          <div className="mt-4 text-sm text-gray-500">
            {Math.round(loadingProgress)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">AvaShooter Game</h1>
              <p className="text-gray-400 text-sm">Room: {roomId}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Exit Game
          </button>
        </div>
      </div>

      {/* Game Iframe */}
      <div className="pt-16 h-full">
        <iframe 
          src="about:blank" 
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="AvaShooter Game"
        />
      </div>
    </div>
  );
}

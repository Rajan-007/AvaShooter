'use client';

import { useState, useEffect } from 'react';

interface GameIframeProps {
  roomId: string;
  onClose: () => void;
}

export default function GameIframe({ roomId, onClose }: GameIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
             {loadingProgress >= 60 && loadingProgress < 90 && "Connecting to Starkshoot..."}
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
      {/* Hidden iframe that loads in background */}
      <iframe 
        src="https://starkshoot.netlify.app/" 
        className="absolute -top-9999 left-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="AvaShooter Game"
        onLoad={handleIframeLoad}
      />
      
      {/* Show iframe only after it's loaded */}
      {iframeLoaded && (
        <iframe 
          src="https://starkshoot.netlify.app/" 
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="AvaShooter Game"
        />
      )}
      
      {/* Menu button - only show after iframe is loaded */}
      {iframeLoaded && (
        <div className="absolute top-4 right-4 menu-container">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-gray-800 bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
          >
            <span className="text-white text-opacity-70 hover:text-opacity-100 text-lg">☰</span>
          </button>
          
          {/* Menu dropdown */}
          {showMenu && (
            <div className="absolute top-12 right-0 bg-gray-900 bg-opacity-95 rounded-lg p-2 min-w-40 shadow-lg border border-gray-700">
              <div className="space-y-1">
                <button 
                  onClick={() => window.open('https://starkshoot.netlify.app/', '_blank')}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-gray-700 rounded transition-colors"
                >
                  Open in New Tab
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-gray-700 rounded transition-colors"
                >
                  Reload Game
                </button>
                <button 
                  onClick={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                      iframe.requestFullscreen();
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-gray-700 rounded transition-colors"
                >
                  Fullscreen
                </button>
                <hr className="border-gray-600 my-1" />
                <button 
                  onClick={onClose}
                  className="w-full text-left px-3 py-2 text-red-400 text-sm hover:bg-red-900 hover:bg-opacity-50 rounded transition-colors"
                >
                  Exit Game
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Close from '../assets/button-cancel.svg';

interface SimpleGameFrameProps {
  onClose: () => void;
  gameUrl?: string; // Optional game URL to load
  isLoading?: boolean; // Whether the parent is still loading/processing
}

export default function SimpleGameFrame({ 
  onClose, 
  gameUrl = "about:blank", // Default to blank page
  isLoading = false 
}: SimpleGameFrameProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  // Show iframe when loading is complete and iframe is loaded
  useEffect(() => {
    if (!isLoading && iframeLoaded) {
      setShowIframe(true);
    }
  }, [isLoading, iframeLoaded]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-80 z-40"></div>
      
      {/* Game container */}
      <div className="relative w-5/6 h-5/6 bg-gray-900 rounded-lg z-50 overflow-hidden border-4 border-yellow-400">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 transform hover:scale-110 transition duration-300"
        >
          <Image src={Close} alt="Close" width={50} height={50} />
        </button>

        {/* Loading overlay - shown while parent is loading or iframe is not ready */}
        {(!showIframe || isLoading) && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-yellow-400 text-lg font-bold">
                {isLoading ? "Preparing game..." : "Loading game..."}
              </p>
              {isLoading && (
                <p className="text-gray-400 text-sm mt-2">
                  Please wait while we set up your game session
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hidden iframe that loads in background */}
        <iframe 
          src={gameUrl}
          title="Game Frame"
          className={`w-full h-full border-0 transition-opacity duration-500 ${
            showIframe ? 'opacity-100' : 'opacity-0'
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          style={{ 
            visibility: showIframe ? 'visible' : 'hidden',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        ></iframe>
      </div>
    </div>
  );
}
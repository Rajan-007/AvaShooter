'use client';
// import { useState } from 'react';
import Image from 'next/image';
import Close from '../assets/button-cancel.svg';

interface SimpleGameFrameProps {
  onClose: () => void;
}

export default function SimpleGameFrame({ onClose }: SimpleGameFrameProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-80 z-40"></div>
      
      {/* Game container with just the iframe and close button */}
      <div className="relative w-5/6 h-5/6 bg-gray-900 rounded-lg z-50 overflow-hidden border-4 border-yellow-400">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 transform hover:scale-110 transition duration-300"
        >
          <Image src={Close} alt="Close" width={50} height={50} />
        </button>

        {/* Simple iframe */}
        <iframe 
          src="about:blank" 
          title="Game Frame"
          className="w-full h-full border-0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
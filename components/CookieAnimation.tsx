'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface CookieAnimationProps {
  message: string;
  senderName: string;
  skin?: string | null;
  onOpenComplete?: () => void;
}

const SKIN_CONFIGS = {
  original: {
    leftStops: ['#FDE68A', '#F59E0B', '#B45309'],
    rightStops: ['#FEF3C7', '#F59E0B', '#92400E'],
    stroke: '#D97706',
    confettiColors: ['#F59E0B', '#FCD34D', '#FFFBEB', '#D97706', '#EAB308'],
    auraClass: 'bg-amber-400',
  },
  pink: {
    leftStops: ['#FCE7F3', '#FF6B9D', '#C2185B'],
    rightStops: ['#FDF2F8', '#FF6B9D', '#AD1457'],
    stroke: '#D81B60',
    confettiColors: ['#FF6B9D', '#FBCFE8', '#F472B6', '#EC4899', '#BE185D'],
    auraClass: 'bg-pink-400',
  },
  coral: {
    leftStops: ['#FFE0B2', '#FFA07A', '#E64A19'],
    rightStops: ['#FFF3E0', '#FFA07A', '#D84315'],
    stroke: '#F4511E',
    confettiColors: ['#FFA07A', '#FFEDD5', '#FB923C', '#F97316', '#C2410C'],
    auraClass: 'bg-orange-400',
  },
  gold: {
    leftStops: ['#FFF59D', '#FFD700', '#E65100'],
    rightStops: ['#FFFDE7', '#FFD700', '#FF8F00'],
    stroke: '#FFB300',
    confettiColors: ['#FFD700', '#FFF59D', '#FCD34D', '#EAB308', '#B45309'],
    auraClass: 'bg-yellow-400',
  },
};

export default function CookieAnimation({ message, senderName, skin, onOpenComplete }: CookieAnimationProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const currentSkin = (skin as keyof typeof SKIN_CONFIGS) || 'original';
  const config = SKIN_CONFIGS[currentSkin] || SKIN_CONFIGS.original;

  const handleCrack = () => {
    if (isOpened || isOpening) return;
    setIsOpening(true);

    // Fire fireworks/confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: config.confettiColors,
    });

    // Animate cracking
    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
      if (onOpenComplete) {
        onOpenComplete();
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] select-none py-8">
      <div className="relative w-80 h-64 flex items-center justify-center cursor-pointer" onClick={handleCrack}>
        {/* Glowing aura under the cookie */}
        <div className={`absolute w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-1000 ${config.auraClass} ${
          isOpened ? 'scale-150 opacity-10' : 'animate-pulse scale-100'
        }`} />

        {/* Fortune Cookie Drawing (Left Side) */}
        <div
          className={`absolute transition-all duration-1000 ease-out origin-left ${
            isOpening ? 'translate-x-[-15px] rotate-[-5deg]' : ''
          } ${
            isOpened ? 'translate-x-[-120px] rotate-[-45deg] opacity-0 pointer-events-none' : ''
          }`}
          style={{ transitionDelay: '0s' }}
        >
          <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            <path
              d="M50 20 C20 20 15 50 35 75 C45 85 50 80 50 50 Z"
              fill={`url(#skinGradientLeft-${currentSkin})`}
            />
            <path
              d="M35 75 C45 70 48 55 45 40"
              stroke={config.stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            <defs>
              <linearGradient id={`skinGradientLeft-${currentSkin}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={config.leftStops[0]} />
                <stop offset="50%" stopColor={config.leftStops[1]} />
                <stop offset="100%" stopColor={config.leftStops[2]} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Fortune Cookie Drawing (Right Side) */}
        <div
          className={`absolute transition-all duration-1000 ease-out origin-right ${
            isOpening ? 'translate-x-[15px] rotate-[5deg]' : ''
          } ${
            isOpened ? 'translate-x-[120px] rotate-[45deg] opacity-0 pointer-events-none' : ''
          }`}
        >
          <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            <path
              d="M50 20 C80 20 85 50 65 75 C55 85 50 80 50 50 Z"
              fill={`url(#skinGradientRight-${currentSkin})`}
            />
            <path
              d="M65 75 C55 70 52 55 55 40"
              stroke={config.stroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            <defs>
              <linearGradient id={`skinGradientRight-${currentSkin}`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={config.rightStops[0]} />
                <stop offset="50%" stopColor={config.rightStops[1]} />
                <stop offset="100%" stopColor={config.rightStops[2]} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Unrolling Fortune Paper Strip */}
        <div
          className={`absolute w-80 bg-gradient-to-b from-amber-50/95 via-amber-50/90 to-orange-50/95 border border-amber-200/60 rounded-2xl px-6 py-6 shadow-2xl transition-all duration-1000 ease-out flex flex-col items-center justify-center text-center ${
            isOpened
              ? 'scale-100 opacity-100 rotate-0 translate-y-0'
              : 'scale-0 opacity-0 rotate-12 translate-y-10 pointer-events-none'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          {/* Elegant gold foil inner border */}
          <div className="absolute inset-1.5 border border-amber-500/20 rounded-xl pointer-events-none" />
          <div className="absolute inset-2 border border-dashed border-amber-500/30 rounded-lg pointer-events-none" />
          
          {/* Elegant top badge */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest shadow-sm mb-3">
            ✨ TODAY'S FORTUNE ✨
          </div>

          <p className="text-zinc-800 font-extrabold text-lg leading-relaxed my-2 px-1 break-keep">
            "{message}"
          </p>

          <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-3" />

          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            From. <span className="text-amber-600">{senderName || '익명'}</span>
          </div>

          {/* Sparkly decorative emojis */}
          <span className="absolute -top-3 -right-3 text-xl animate-bounce">✨</span>
          <span className="absolute -bottom-3 -left-3 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
        </div>

        {/* Crack Hint overlay */}
        {!isOpened && !isOpening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/85 dark:bg-black/85 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200/50 shadow-md text-amber-700 dark:text-amber-300 font-semibold text-xs tracking-wider animate-bounce flex items-center gap-1.5 mt-44">
              <span>🥠</span> 쿠키를 터치해 깨뜨려보세요!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

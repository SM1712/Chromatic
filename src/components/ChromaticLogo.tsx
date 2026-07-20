import React from 'react';

interface ChromaticLogoProps {
  size?: number;
  className?: string;
}

export const ChromaticLogo: React.FC<ChromaticLogoProps> = ({ size = 34, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`chromatic-logo-icon ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        {/* Crisp shadow for white badge container */}
        <filter id="white-badge-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* WHITE Background Badge Container */}
      <rect 
        x="2" 
        y="2" 
        width="60" 
        height="60" 
        rx="16" 
        fill="#FFFFFF" 
        stroke="#E2E8F0" 
        strokeWidth="1.5"
        filter="url(#white-badge-shadow)"
      />

      {/* Geometric Camera Aperture Shutter - 6 Minimalist Color Blades */}
      <g>
        {/* Blade 1 - Blue */}
        <path 
          d="M 29 25 L 47 19 L 49 35 L 36 35 Z" 
          fill="#2563EB" 
          transform="rotate(0 32 32)"
        />
        {/* Blade 2 - Violet */}
        <path 
          d="M 29 25 L 47 19 L 49 35 L 36 35 Z" 
          fill="#7C3AED" 
          transform="rotate(60 32 32)"
        />
        {/* Blade 3 - Fuchsia */}
        <path 
          d="M 29 25 L 47 19 L 49 35 L 36 35 Z" 
          fill="#EC4899" 
          transform="rotate(120 32 32)"
        />
        {/* Blade 4 - Coral Red */}
        <path 
          d="M 29 25 L 47 19 L 49 35 L 36 35 Z" 
          fill="#EF4444" 
          transform="rotate(180 32 32)"
        />
        {/* Blade 5 - Amber Orange */}
        <path 
          d="M 29 25 L 47 19 L 49 35 L 36 35 Z" 
          fill="#F59E0B" 
          transform="rotate(240 32 32)"
        />
        {/* Blade 6 - Emerald Teal */}
        <path 
          d="M 29 25 L 47 19 L 49 35 L 36 35 Z" 
          fill="#10B981" 
          transform="rotate(300 32 32)"
        />

        {/* Central White Lens Opening */}
        <circle cx="32" cy="32" r="7.5" fill="#FFFFFF" />
        <circle cx="32" cy="32" r="3.8" fill="#0F172A" />
      </g>
    </svg>
  );
};

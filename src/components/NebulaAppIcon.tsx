import React from 'react';

interface NebulaAppIconProps {
  className?: string;
  size?: number;
}

export const NebulaAppIcon: React.FC<NebulaAppIconProps> = ({ className = 'w-6 h-6', size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      style={style}
    >
      <defs>
        {/* Glass Border Gradient (Electric Cyan to Hot Crimson) */}
        <linearGradient id="nebulaBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#A855F7" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FF1744" stopOpacity="0.95" />
        </linearGradient>

        {/* Cyan Swirl Gradient */}
        <linearGradient id="nebulaCyanSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Red Swirl Gradient */}
        <linearGradient id="nebulaRedSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Glow Effect */}
        <filter id="nebulaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Glass Base Container */}
      <rect
        x="40"
        y="40"
        width="432"
        height="432"
        rx="96"
        ry="96"
        fill="#10132B"
        fillOpacity="0.85"
        stroke="url(#nebulaBorderGrad)"
        strokeWidth="10"
      />

      {/* Swirling Cosmic Nebula Spiral Paths */}
      <g filter="url(#nebulaGlow)">
        {/* Blue / Cyan Swirl */}
        <path
          d="M 256 110 C 160 130, 120 210, 150 310 C 180 400, 260 420, 330 380 C 230 390, 175 330, 195 250 C 205 195, 260 150, 330 160 Z"
          fill="url(#nebulaCyanSwirl)"
          opacity="0.88"
        />

        {/* Red / Crimson Swirl */}
        <path
          d="M 256 402 C 352 382, 392 302, 362 202 C 332 112, 252 92, 182 132 C 282 122, 337 182, 317 262 C 307 317, 252 362, 182 352 Z"
          fill="url(#nebulaRedSwirl)"
          opacity="0.88"
        />
      </g>

      {/* Central Play Triangle Overlay */}
      <g filter="url(#nebulaGlow)" transform="translate(18, 0)">
        <path
          d="M 215 165 C 225 155, 245 155, 255 165 L 345 235 C 360 245, 360 265, 345 275 L 255 345 C 245 355, 225 355, 215 345 L 215 165 Z"
          fill="none"
          stroke="url(#nebulaBorderGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Center Starburst Core */}
      <circle cx="274" cy="256" r="18" fill="#FFFFFF" filter="url(#nebulaGlow)" />
      <path
        d="M 274 216 L 274 296 M 234 256 L 314 256"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};

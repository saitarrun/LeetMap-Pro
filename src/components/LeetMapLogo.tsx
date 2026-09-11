import React from 'react';

interface LeetMapLogoProps {
  size?: number;
  className?: string;
}

export const LeetMapLogo: React.FC<LeetMapLogoProps> = ({ size = 26, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-[26%] bg-[#000000] shadow-sm border border-white/15 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%]"
      >
        {/* Left code chevron */}
        <path
          d="M12 9.5L6.5 16L12 22.5"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right code chevron */}
        <path
          d="M20 9.5L25.5 16L20 22.5"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center emerald waypoint diamond */}
        <polygon
          points="16,11.8 20.2,16 16,20.2 11.8,16"
          fill="#10B981"
        />
      </svg>
    </div>
  );
};

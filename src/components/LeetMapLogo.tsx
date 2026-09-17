import React from 'react';

interface LeetMapLogoProps {
  size?: number;
  className?: string;
}

export const LeetMapLogo: React.FC<LeetMapLogoProps> = ({ size = 26, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-[26%] bg-[#09090B] shadow-sm border border-white/15 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[88%] h-[88%]">
        <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2.5" className="text-zinc-600 dark:text-zinc-500 opacity-60" />
        <polygon points="24,8 32,24 24,22" fill="#10B981" />
        <polygon points="24,8 24,22 16,24" fill="#6EE7B7" />
        <polygon points="24,40 16,24 24,26" fill="#FFFFFF" />
        <polygon points="24,40 24,26 32,24" fill="#94A3B8" />
        <circle cx="24" cy="24" r="2.8" fill="#09090B" stroke="#FFFFFF" strokeWidth="1.2" />
      </svg>
    </div>
  );
};

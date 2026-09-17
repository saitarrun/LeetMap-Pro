import React from 'react';

interface LeetMapLogoProps {
  size?: number;
  className?: string;
}

export const LeetMapLogo: React.FC<LeetMapLogoProps> = ({ size = 26, className = '' }) => {
  return (
    <span
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-transform duration-200 group-hover:scale-110 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" className="text-zinc-400 dark:text-zinc-600 opacity-60" />
        <polygon points="24,6 33,24 24,21" fill="#10B981" />
        <polygon points="24,6 24,21 15,24" fill="#34D399" />
        <polygon points="24,42 15,24 24,27" fill="#F43F5E" />
        <polygon points="24,42 24,27 33,24" fill="#E11D48" />
        <circle cx="24" cy="24" r="3.2" fill="#09090B" stroke="#FFFFFF" strokeWidth="1.6" />
      </svg>
    </span>
  );
};

'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface BottomAdBannerProps {
  slotId?: string;
  className?: string;
}

export const BottomAdBanner: React.FC<BottomAdBannerProps> = ({
  slotId,
  className = '',
}) => {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  // Suppress ads on sensitive, auth, and utility screens
  const isExcludedRoute =
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/sign-up') ||
    pathname?.startsWith('/account') ||
    pathname?.startsWith('/settings');

  useEffect(() => {
    if (isExcludedRoute || pushedRef.current) return;

    // Do not trigger programmatic ad requests during search crawler indexing
    if (typeof navigator !== 'undefined' && /Googlebot|AdsBot|Mediapartners/i.test(navigator.userAgent)) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
        adsbygoogle.push({});
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = adsbygoogle;
        pushedRef.current = true;
      }
    } catch {
      // Gracefully silence if blocked by user ad blocker or still loading
    }
  }, [pathname, isExcludedRoute]);

  if (isExcludedRoute) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full max-w-5xl mx-auto px-4 sm:px-6 my-6 sm:my-8 ${className}`}
    >
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/70 backdrop-blur-sm p-3 sm:p-4 text-center overflow-hidden transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Subtle, minimalist disclosure tag */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]/60 text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            Sponsored
          </span>
          <span className="opacity-60 hover:opacity-100 transition-opacity">
            LeetMap Community Partner
          </span>
        </div>

        {/* AdSense In-feed / Display Unit */}
        <div className="min-h-[90px] sm:min-h-[100px] flex items-center justify-center overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '280px', width: '100%', textAlign: 'center' }}
            data-ad-client="ca-pub-5930264634833391"
            {...(slotId ? { 'data-ad-slot': slotId } : {})}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </aside>
  );
};

export default BottomAdBanner;

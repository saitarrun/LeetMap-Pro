import { fetchPublicUserProfile } from '@/utils/server-user';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPrepLevel(total: number) {
  if (total >= 150) return { level: 'Lv. 5', name: 'Grandmaster', color: '#a855f7' };
  if (total >= 75) return { level: 'Lv. 4', name: 'Strategist', color: '#38bdf8' };
  if (total >= 30) return { level: 'Lv. 3', name: 'Competitor', color: '#34d399' };
  if (total >= 10) return { level: 'Lv. 2', name: 'Apprentice', color: '#2dd4bf' };
  return { level: 'Lv. 1', name: 'Foundation', color: '#94a3b8' };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const safeUsername = username.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');

  const url = new URL(request.url);
  const style = url.searchParams.get('style') || 'card';

  const profileData = await fetchPublicUserProfile(safeUsername);

  const totalSolved = profileData?.stats.totalSolved || 0;
  const easyCount = profileData?.stats.easyCount || 0;
  const mediumCount = profileData?.stats.mediumCount || 0;
  const hardCount = profileData?.stats.hardCount || 0;
  const streak = profileData?.stats.currentStreak || 0;
  const displayName = profileData?.user.name || safeUsername;
  const topCompany = profileData?.topCompaniesBreakdown?.[0]?.name || 'FAANG Ready';
  const level = getPrepLevel(totalSolved);

  let svgContent = '';

  if (style === 'shield' || style === 'compact') {
    // Compact pill badge (similar to shields.io)
    const label = 'LeetMap Pro';
    const value = `${totalSolved} Solved • ${streak}d Streak`;
    const labelWidth = 96;
    const valueWidth = Math.max(160, value.length * 8.5 + 20);
    const totalWidth = labelWidth + valueWidth;

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" viewBox="0 0 ${totalWidth} 28" fill="none" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <clipPath id="r">
    <rect width="${totalWidth}" height="28" rx="6" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="28" fill="#161b22"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="28" fill="#10b981"/>
    <rect id="glow" width="${totalWidth}" height="28" fill="url(#overlay)" opacity="0.1"/>
  </g>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600">
    <!-- Brand Icon Dot -->
    <circle cx="16" cy="14" r="4" fill="#34d399"/>
    <text x="28" y="18" fill="#e6edf3" letter-spacing="0.2">${escapeXml(label)}</text>
    <text x="${labelWidth + 14}" y="18" fill="#042f2e" font-weight="700">${escapeXml(value)}</text>
  </g>
</svg>`;
  } else {
    // Rich Editorial Card (default)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="490" height="175" viewBox="0 0 490 175" fill="none" role="img" aria-label="LeetMap Pro Stats for ${escapeXml(displayName)}">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="490" y2="175" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#161b22" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>

  <!-- Card Background with subtle border -->
  <rect width="490" height="175" rx="14" fill="url(#cardGrad)" stroke="#30363d" stroke-width="1.2" />

  <!-- Ambient Glow Accent -->
  <circle cx="440" cy="30" r="80" fill="#10b981" opacity="0.08" filter="blur(20px)" />

  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <!-- Header Row -->
    <g transform="translate(24, 28)">
      <!-- Brand Logo Indicator -->
      <rect width="18" height="18" rx="5" fill="#10b981" opacity="0.2" stroke="#10b981" stroke-width="1" />
      <circle cx="9" cy="9" r="3.5" fill="#34d399" />
      
      <text x="26" y="14" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="-0.01em">LeetMap <tspan fill="#34d399">Pro</tspan></text>
      <text x="135" y="14" font-size="12" font-weight="500" fill="#8b949e">/@${escapeXml(safeUsername)}</text>
      
      <!-- Prep Level Badge -->
      <g transform="translate(320, -3)">
        <rect width="120" height="24" rx="12" fill="rgba(255, 255, 255, 0.05)" stroke="#30363d" stroke-width="1" />
        <circle cx="12" cy="12" r="3.5" fill="${level.color}" />
        <text x="22" y="16" font-size="11" font-weight="700" fill="#e6edf3">${escapeXml(level.level)} ${escapeXml(level.name)}</text>
      </g>
    </g>

    <!-- Main Stats Section -->
    <g transform="translate(24, 76)">
      <!-- Total Solved -->
      <text x="0" y="32" font-size="36" font-weight="800" fill="#ffffff" letter-spacing="-0.03em">${totalSolved}</text>
      <text x="0" y="48" font-size="10" font-weight="700" fill="#8b949e" letter-spacing="0.06em">PROBLEMS SOLVED</text>

      <!-- Difficulty Pillars -->
      <g transform="translate(145, 2)">
        <g transform="translate(0, 0)">
          <text x="0" y="12" font-size="11" font-weight="600" fill="#7ee787">Easy</text>
          <text x="44" y="12" font-size="13" font-weight="700" fill="#ffffff">${easyCount}</text>
        </g>
        <g transform="translate(0, 22)">
          <text x="0" y="12" font-size="11" font-weight="600" fill="#f6c177">Med</text>
          <text x="44" y="12" font-size="13" font-weight="700" fill="#ffffff">${mediumCount}</text>
        </g>
        <g transform="translate(0, 44)">
          <text x="0" y="12" font-size="11" font-weight="600" fill="#ff7b72">Hard</text>
          <text x="44" y="12" font-size="13" font-weight="700" fill="#ffffff">${hardCount}</text>
        </g>
      </g>

      <!-- Divider line -->
      <line x1="250" y1="0" x2="250" y2="52" stroke="#21262d" stroke-width="1" />

      <!-- Streak & Focus -->
      <g transform="translate(270, 4)">
        <g transform="translate(0, 10)">
          <text x="0" y="12" font-size="13" font-weight="700" fill="#f0883e">🔥 ${streak} Days</text>
          <text x="75" y="12" font-size="11" font-weight="500" fill="#8b949e">Active Streak</text>
        </g>
        <g transform="translate(0, 34)">
          <text x="0" y="12" font-size="12" font-weight="600" fill="#58a6ff">🎯 Target:</text>
          <text x="58" y="12" font-size="12" font-weight="600" fill="#e6edf3">${escapeXml(topCompany)}</text>
        </g>
      </g>
    </g>

    <!-- Bottom Footer Accent -->
    <g transform="translate(24, 154)">
      <line x1="0" y1="0" x2="442" y2="0" stroke="#21262d" stroke-width="1" />
      <text x="0" y="13" font-size="10" font-weight="500" fill="#484f58">Verified Company &amp; SQL Preparation</text>
      <text x="442" y="13" text-anchor="end" font-size="10" font-weight="600" fill="#34d399">leetmap-pro.vercel.app</text>
    </g>
  </g>
</svg>`;
  }

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

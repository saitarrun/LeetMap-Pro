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
  const level = getPrepLevel(totalSolved);

  const targetParam = url.searchParams.get('target')?.trim().toLowerCase();

  let targetLabel = '🎯 Target:';
  let targetValue = '';
  let targetColor = '#58a6ff';

  const knownCompanyNames: Record<string, string> = {
    google: 'Google',
    meta: 'Meta',
    amazon: 'Amazon',
    microsoft: 'Microsoft',
    apple: 'Apple',
    netflix: 'Netflix',
    uber: 'Uber',
    bloomberg: 'Bloomberg',
    citadel: 'Citadel',
    tiktok: 'TikTok',
    stripe: 'Stripe',
    salesforce: 'Salesforce',
    'goldman-sachs': 'Goldman Sachs',
    linkedin: 'LinkedIn',
    nvidia: 'NVIDIA',
    adobe: 'Adobe',
    oracle: 'Oracle',
    airbnb: 'Airbnb',
    palantir: 'Palantir',
    databricks: 'Databricks',
    snowflake: 'Snowflake',
    doordash: 'DoorDash',
  };

  if (targetParam === 'none' || targetParam === 'hide') {
    targetLabel = '⚡ Status:';
    targetValue = 'Active Prep';
    targetColor = '#3fb950';
  } else if (targetParam && targetParam !== 'auto') {
    targetLabel = '🎯 Target:';
    targetValue = knownCompanyNames[targetParam] || (targetParam.charAt(0).toUpperCase() + targetParam.slice(1));
    targetColor = '#58a6ff';
  } else {
    // Auto mode: check if user has actual solved problems for any company
    const bestSolvedCompany = profileData?.topCompaniesBreakdown?.find((c) => c.solved > 0);
    if (bestSolvedCompany) {
      targetLabel = '🎯 Target:';
      targetValue = bestSolvedCompany.name;
      targetColor = '#58a6ff';
    } else {
      targetLabel = '🎯 Focus:';
      targetValue = 'FAANG / Big Tech';
      targetColor = '#38bdf8';
    }
  }

  let svgContent = '';

  if (style === 'shield' || style === 'compact') {
    // Minimalist pill badge
    const label = 'LeetMap Pro';
    const value = `${totalSolved} Solved • ${streak}d Streak`;
    const labelWidth = 98;
    const valueWidth = Math.max(150, value.length * 8 + 24);
    const totalWidth = labelWidth + valueWidth;

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" viewBox="0 0 ${totalWidth} 28" fill="none" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <clipPath id="r">
    <rect width="${totalWidth}" height="28" rx="6" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="28" fill="#161b22"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="28" fill="#0d1117"/>
    <rect width="${totalWidth}" height="28" stroke="#30363d" stroke-width="1" fill="none"/>
  </g>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="600">
    <circle cx="14" cy="14" r="3.5" fill="#3fb950"/>
    <text x="24" y="18" fill="#f0f6fc">${escapeXml(label)}</text>
    <text x="${labelWidth + 14}" y="18" fill="#3fb950">${escapeXml(value)}</text>
  </g>
</svg>`;
  } else {
    // Sleek Minimalist Editorial Card
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="150" viewBox="0 0 450 150" fill="none" role="img" aria-label="LeetMap Pro Stats for ${escapeXml(displayName)}">
  <defs>
    <linearGradient id="topSheen" x1="0" y1="0" x2="450" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0"/>
      <stop offset="25%" stop-color="#10b981" stop-opacity="0.5"/>
      <stop offset="75%" stop-color="#38bdf8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Card Canvas -->
  <rect x="0.5" y="0.5" width="449" height="149" rx="12" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
  <!-- Top Accent Sheen -->
  <line x1="30" y1="1" x2="420" y2="1" stroke="url(#topSheen)" stroke-width="1.5" stroke-linecap="round"/>

  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">
    <!-- Header -->
    <g transform="translate(20, 24)">
      <circle cx="4" cy="-4" r="3.5" fill="#3fb950"/>
      <text x="14" y="0" font-size="13" font-weight="700" fill="#f0f6fc" letter-spacing="-0.2px">LeetMap <tspan fill="#3fb950">Pro</tspan></text>
      <text x="105" y="0" font-size="12" fill="#484f58">•</text>
      <text x="117" y="0" font-size="12" fill="#8b949e" font-weight="500">@${escapeXml(safeUsername)}</text>

      <!-- Level Pill -->
      <g transform="translate(294, -12)">
        <rect width="116" height="22" rx="11" fill="rgba(255, 255, 255, 0.04)" stroke="#30363d" stroke-width="1"/>
        <circle cx="11" cy="11" r="3" fill="${level.color}"/>
        <text x="20" y="15" font-size="11" font-weight="600" fill="#c9d1d9">${escapeXml(level.level)} · ${escapeXml(level.name)}</text>
      </g>
    </g>

    <!-- Center Content Section -->
    <!-- Solved Counter -->
    <g transform="translate(24, 60)">
      <text x="0" y="26" font-size="32" font-weight="700" fill="#f0f6fc" letter-spacing="-0.5px">${totalSolved}</text>
      <text x="0" y="42" font-size="10" font-weight="600" fill="#8b949e" letter-spacing="0.6px">SOLVED</text>
    </g>

    <line x1="116" y1="52" x2="116" y2="104" stroke="#21262d" stroke-width="1"/>

    <!-- Difficulty Breakdown -->
    <g transform="translate(134, 52)">
      <circle cx="4" cy="10" r="3" fill="#3fb950"/>
      <text x="14" y="13" font-size="11" font-weight="500" fill="#8b949e">Easy</text>
      <text x="70" y="13" font-size="12" font-weight="600" fill="#f0f6fc" text-anchor="end">${easyCount}</text>

      <circle cx="4" cy="28" r="3" fill="#d29922"/>
      <text x="14" y="31" font-size="11" font-weight="500" fill="#8b949e">Medium</text>
      <text x="70" y="31" font-size="12" font-weight="600" fill="#f0f6fc" text-anchor="end">${mediumCount}</text>

      <circle cx="4" cy="46" r="3" fill="#f85149"/>
      <text x="14" y="49" font-size="11" font-weight="500" fill="#8b949e">Hard</text>
      <text x="70" y="49" font-size="12" font-weight="600" fill="#f0f6fc" text-anchor="end">${hardCount}</text>
    </g>

    <line x1="228" y1="52" x2="228" y2="104" stroke="#21262d" stroke-width="1"/>

    <!-- Streak & Target Focus -->
    <g transform="translate(248, 56)">
      <text x="0" y="15" font-size="12" font-weight="600" fill="#f0883e">🔥 ${streak} Days <tspan font-weight="400" fill="#8b949e" font-size="11">Streak</tspan></text>
      <text x="0" y="38" font-size="11" font-weight="500" fill="#8b949e">${targetLabel} <tspan font-weight="600" fill="${targetColor}">${escapeXml(targetValue)}</tspan></text>
    </g>

    <!-- Bottom Bar -->
    <line x1="20" y1="118" x2="430" y2="118" stroke="#21262d" stroke-width="1"/>
    <text x="20" y="134" font-size="10" font-weight="500" fill="#484f58">Verified Company &amp; SQL Questions</text>
    <text x="430" y="134" font-size="10" font-weight="600" fill="#3fb950" text-anchor="end">leetmap-pro.vercel.app</text>
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

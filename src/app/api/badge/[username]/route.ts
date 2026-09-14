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
  if (!safeUsername) {
    return new Response('Invalid username', { status: 400 });
  }

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

  let targetType: 'target' | 'status' | 'focus' = 'target';
  let targetLabel = 'Target';
  let targetValue = '';
  let targetColor = '#38bdf8';

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
    targetType = 'status';
    targetLabel = 'Status';
    targetValue = 'Active Prep';
    targetColor = '#10b981';
  } else if (targetParam && targetParam !== 'auto') {
    targetType = 'target';
    targetLabel = 'Target';
    targetValue = knownCompanyNames[targetParam] || (targetParam.charAt(0).toUpperCase() + targetParam.slice(1));
    targetColor = '#38bdf8';
  } else {
    // Auto mode: check if user has actual solved problems for any company
    const bestSolvedCompany = profileData?.topCompaniesBreakdown?.find((c) => c.solved > 0);
    if (bestSolvedCompany) {
      targetType = 'target';
      targetLabel = 'Target';
      targetValue = bestSolvedCompany.name;
      targetColor = '#38bdf8';
    } else {
      targetType = 'focus';
      targetLabel = 'Focus';
      targetValue = 'FAANG / Big Tech';
      targetColor = '#38bdf8';
    }
  }

  let svgContent = '';

  if (style === 'shield' || style === 'compact') {
    // Apple-grade Minimalist Pill Badge (shields.io compatible, symmetric curves, optical centering)
    const label = 'LeetMap Pro';
    const value = `${totalSolved} Solved • ${streak}d Streak`;
    const labelWidth = 108;
    const valueWidth = Math.max(130, Math.round(value.length * 6.8 + 26));
    const totalWidth = labelWidth + valueWidth;

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" viewBox="0 0 ${totalWidth} 28" fill="none" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <defs>
    <clipPath id="pillClip">
      <rect width="${totalWidth}" height="28" rx="14" fill="#fff"/>
    </clipPath>
  </defs>
  <g clip-path="url(#pillClip)">
    <rect width="${labelWidth}" height="28" fill="#161b22"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="28" fill="#0d1117"/>
    <line x1="${labelWidth}" y1="0" x2="${labelWidth}" y2="28" stroke="#30363d" stroke-width="1"/>
  </g>
  <!-- Crisp outer border drawn outside clipPath so corners are never clipped -->
  <rect x="0.5" y="0.5" width="${totalWidth - 1}" height="27" rx="13.5" stroke="#30363d" stroke-width="1" fill="none"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="600">
    <circle cx="15" cy="14" r="3.5" fill="#10b981"/>
    <text x="26" y="14" dominant-baseline="central" fill="#f8fafc">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" text-anchor="middle" dominant-baseline="central" fill="#10b981">${escapeXml(value)}</text>
  </g>
</svg>`;
  } else {
    // Apple-grade Minimalist Bento Card
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="150" viewBox="0 0 450 150" fill="none" role="img" aria-label="LeetMap Pro Stats for ${escapeXml(displayName)}">
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#141820"/>
      <stop offset="100%" stop-color="#0c0e13"/>
    </linearGradient>
    <linearGradient id="topSheen" x1="0" y1="0" x2="450" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0"/>
      <stop offset="25%" stop-color="#10b981" stop-opacity="0.4"/>
      <stop offset="75%" stop-color="#38bdf8" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Card Canvas with Apple Squircle Radius -->
  <rect x="0.5" y="0.5" width="449" height="149" rx="16" fill="url(#cardBg)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
  <!-- Top Specular Sheen -->
  <line x1="24" y1="1" x2="426" y2="1" stroke="url(#topSheen)" stroke-width="1.2" stroke-linecap="round"/>

  <g font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Helvetica, Arial, sans-serif">
    <!-- Header -->
    <g transform="translate(20, 24)">
      <!-- Mark -->
      <circle cx="4" cy="-4" r="3" fill="#10b981"/>
      <text x="14" y="0" font-size="13" font-weight="600" fill="#f8fafc" letter-spacing="-0.2px">LeetMap <tspan fill="#10b981">Pro</tspan></text>
      <text x="105" y="0" font-size="11" fill="#475569">•</text>
      <text x="116" y="0" font-size="12" fill="#94a3b8" font-weight="500">@${escapeXml(safeUsername)}</text>

      <!-- Translucent Level Pill -->
      <g transform="translate(294, -12)">
        <rect width="116" height="22" rx="11" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
        <circle cx="11" cy="11" r="3" fill="${level.color}"/>
        <text x="20" y="15" font-size="11" font-weight="500" fill="#cbd5e1">${escapeXml(level.level)} · ${escapeXml(level.name)}</text>
      </g>
    </g>

    <!-- Center Content Section -->
    <!-- Solved Counter -->
    <g transform="translate(24, 60)">
      <text x="0" y="26" font-size="32" font-weight="700" fill="#f8fafc" letter-spacing="-0.03em">${totalSolved}</text>
      <text x="0" y="42" font-size="9" font-weight="600" fill="#64748b" letter-spacing="0.08em">PROBLEMS SOLVED</text>
    </g>

    <line x1="116" y1="52" x2="116" y2="104" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>

    <!-- Difficulty Breakdown -->
    <g transform="translate(134, 52)">
      <circle cx="4" cy="10" r="2.5" fill="#10b981"/>
      <text x="14" y="13" font-size="11" font-weight="500" fill="#94a3b8">Easy</text>
      <text x="70" y="13" font-size="12" font-weight="600" fill="#f8fafc" text-anchor="end">${easyCount}</text>

      <circle cx="4" cy="28" r="2.5" fill="#f59e0b"/>
      <text x="14" y="31" font-size="11" font-weight="500" fill="#94a3b8">Med</text>
      <text x="70" y="31" font-size="12" font-weight="600" fill="#f8fafc" text-anchor="end">${mediumCount}</text>

      <circle cx="4" cy="46" r="2.5" fill="#ef4444"/>
      <text x="14" y="49" font-size="11" font-weight="500" fill="#94a3b8">Hard</text>
      <text x="70" y="49" font-size="12" font-weight="600" fill="#f8fafc" text-anchor="end">${hardCount}</text>
    </g>

    <line x1="228" y1="52" x2="228" y2="104" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>

    <!-- Streak & Target Focus (Clean Vector Icons, Zero Overlap, Optical Centering) -->
    <g transform="translate(248, 54)">
      <!-- Row 1: Streak with Vector Flame -->
      <g transform="translate(0, 4)">
        <path d="M6 1C6 1 3.5 3.5 3.5 6C3.5 7.4 4.6 8.5 6 8.5C7.4 8.5 8.5 7.4 8.5 6C8.5 4.5 7.5 3 7.5 3C7.5 3 6.9 4.2 6.3 4.2C5.7 4.2 5.4 3.4 6 1Z" fill="#f59e0b" transform="scale(1.2)"/>
        <text x="18" y="6" dominant-baseline="central" font-size="12" font-weight="600" fill="#f8fafc">${streak}&#160;<tspan font-weight="400" fill="#94a3b8" font-size="11">Days Streak</tspan></text>
      </g>

      <!-- Row 2: Target / Status with Vector Icon -->
      <g transform="translate(0, 26)">
        ${targetType === 'status' ? `
        <path d="M6 0.5L3 5.5H5.5L5 9.5L8 4.5H5.5L6 0.5Z" fill="#10b981" transform="scale(1.2)"/>
        ` : `
        <circle cx="6" cy="6" r="4.8" stroke="#38bdf8" stroke-width="1.1" fill="none" opacity="0.4"/>
        <circle cx="6" cy="6" r="2.2" stroke="#38bdf8" stroke-width="1.1" fill="none"/>
        <circle cx="6" cy="6" r="0.8" fill="#38bdf8"/>
        `}
        <text x="18" y="6" dominant-baseline="central" font-size="11" font-weight="500" fill="#94a3b8">${targetLabel}:&#160;<tspan font-weight="600" fill="${targetColor}">${escapeXml(targetValue)}</tspan></text>
      </g>
    </g>

    <!-- Bottom Bar -->
    <line x1="20" y1="120" x2="430" y2="120" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>
    <text x="20" y="135" font-size="10" font-weight="500" fill="#64748b">Verified Company &amp; SQL Questions</text>
    <text x="430" y="135" font-size="10" font-weight="500" fill="#10b981" text-anchor="end">www.leetmap-pro.com</text>
  </g>
</svg>`;
  }

  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=0, stale-while-revalidate=10, must-revalidate',
    },
  });
}

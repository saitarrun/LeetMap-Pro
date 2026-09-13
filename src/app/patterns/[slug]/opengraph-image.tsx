import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { PatternDetail } from '@/types';

export const alt = 'LeetMap Pro DSA Coding Pattern Guide';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

const SLUG_ALIASES: Record<string, string> = {
  'arrays-hashing': 'prefix-sum',
  'array-hashing': 'prefix-sum',
  'stack': 'monotonic-stack',
  'linked-list': 'linked-list-manipulation',
  'trees': 'tree-dfs',
  'tree': 'tree-dfs',
  'heap': 'heaps-top-k',
  'heaps': 'heaps-top-k',
  'priority-queue': 'heaps-top-k',
  'tries': 'trie',
  'graphs': 'graph-traversal',
  'graph': 'graph-traversal',
  'advanced-graphs': 'topological-sort',
  'dp-1d': 'dynamic-programming-1d',
  '1d-dp': 'dynamic-programming-1d',
  '1-d-dynamic-programming': 'dynamic-programming-1d',
  'dp-2d': 'dynamic-programming-2d',
  '2d-dp': 'dynamic-programming-2d',
  '2-d-dynamic-programming': 'dynamic-programming-2d',
  'math-geometry': 'matrix-traversal',
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const resolvedSlug = SLUG_ALIASES[safeSlug] || safeSlug;
  const filePath = path.join(process.cwd(), 'public', 'data', 'patterns', `${resolvedSlug}.json`);

  let patternName = safeSlug.replace(/-/g, ' ').toUpperCase();
  let tagline = 'Master curated LeetCode coding patterns with algorithmic roadmaps.';
  let category = 'Algorithm Patterns';
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;
  let topCompanies: string[] = ['Google', 'Meta', 'Amazon', 'Microsoft'];

  if (fs.existsSync(filePath)) {
    try {
      const pattern: PatternDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      patternName = pattern.name;
      tagline = pattern.tagline || tagline;
      category = pattern.category || category;
      total = pattern.total || 0;
      easy = pattern.easy || 0;
      medium = pattern.medium || 0;
      hard = pattern.hard || 0;
      if (pattern.topCompanies && pattern.topCompanies.length > 0) {
        topCompanies = pattern.topCompanies.slice(0, 4);
      }
    } catch {
      // Fallback
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#07080c',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
          padding: '54px 64px',
          overflow: 'hidden',
        }}
      >
        {/* Glow Accents: Violet/Indigo & Emerald for algorithmic patterns */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)',
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a78bfa',
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#c4b5fd',
                  textTransform: 'uppercase',
                }}
              >
                LeetMap Pro
              </span>
            </div>
            <span
              style={{
                fontSize: 14,
                color: '#71717a',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {category}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 13,
              fontWeight: 600,
              color: '#a1a1aa',
            }}
          >
            <span>Coding Pattern Masterclass</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '16px',
            }}
          >
            <h1
              style={{
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                margin: 0,
                color: '#ffffff',
                lineHeight: 1.05,
              }}
            >
              {patternName}
            </h1>
            <span
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: '#a78bfa',
              }}
            >
              Pattern
            </span>
          </div>

          <p
            style={{
              fontSize: 22,
              color: '#94a3b8',
              margin: 0,
              maxWidth: '960px',
              lineHeight: 1.4,
            }}
          >
            {tagline}
          </p>

          {/* Metrics Row */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '16px',
            }}
          >
            {/* Metric 1: Total Problems */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                minWidth: '180px',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#71717a',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Curated Problems
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {total}
              </span>
            </div>

            {/* Metric 2: Difficulty */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#71717a',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                Difficulty Range
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{easy}</span>
                  <span style={{ fontSize: 15, color: '#6ee7b7', fontWeight: 600 }}>Easy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{medium}</span>
                  <span style={{ fontSize: 15, color: '#fcd34d', fontWeight: 600 }}>Med</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{hard}</span>
                  <span style={{ fontSize: 15, color: '#fca5a5', fontWeight: 600 }}>Hard</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Top Companies Asking */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 24px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flex: 1.2,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#71717a',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                Heavily Tested At
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {topCompanies.map((company) => (
                  <div
                    key={company}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#e4e4e7',
                    }}
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '20px',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: '#71717a',
              fontWeight: 500,
            }}
          >
            Pattern recognition • Strategy checklists • Complexity cheat sheets
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#a78bfa',
            }}
          >
            www.leetmap-pro.com/patterns/{safeSlug}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { CompanyDetail } from '@/types';

export const alt = 'LeetMap Pro Company LeetCode Questions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const filePath = path.join(process.cwd(), 'public', 'data', 'companies', `${safeSlug}.json`);

  let companyName = safeSlug.toUpperCase();
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;
  let sqlTotal = 0;
  let topTopics: string[] = ['Array', 'Dynamic Programming', 'Trees', 'Graphs'];

  if (fs.existsSync(filePath)) {
    try {
      const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      companyName = company.name;
      total = company.total || 0;
      easy = company.easy || 0;
      medium = company.medium || 0;
      hard = company.hard || 0;
      sqlTotal = company.sqlTotal || 0;

      // Extract top topics from problems
      const topicCounts: Record<string, number> = {};
      const problems = company.windows?.[0]?.problems || [];
      problems.slice(0, 60).forEach((p) => {
        (p.topics || []).forEach((t) => {
          topicCounts[t] = (topicCounts[t] || 0) + 1;
        });
      });
      const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([t]) => t)
        .filter((t) => t !== 'Database');
      if (sortedTopics.length > 0) {
        topTopics = sortedTopics.slice(0, 4);
      }
    } catch {
      // Fallback to default
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
        {/* Glow Accents */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%)',
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
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 70%)',
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
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#34d399',
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
              Company Interview Sheet
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
            <span>Frequency Verified • 2026</span>
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
                fontSize: 68,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                margin: 0,
                color: '#ffffff',
                lineHeight: 1.05,
              }}
            >
              {companyName}
            </h1>
            <span
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#10b981',
              }}
            >
              Interview Questions
            </span>
          </div>

          <p
            style={{
              fontSize: 22,
              color: '#94a3b8',
              margin: 0,
              maxWidth: '920px',
              lineHeight: 1.4,
            }}
          >
            Real interview questions asked at {companyName}, ranked by candidate frequency and 30-day/6-month recency.
          </p>

          {/* Metrics Row */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '16px',
            }}
          >
            {/* Metric 1: Total */}
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
                Questions
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
                Difficulty Breakdown
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
                {sqlTotal > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{sqlTotal}</span>
                    <span style={{ fontSize: 15, color: '#7dd3fc', fontWeight: 600 }}>SQL</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metric 3: Top Topics */}
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
                Top Patterns
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {topTopics.map((topic) => (
                  <div
                    key={topic}
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
                    {topic}
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
            Study high-frequency questions • Interactive checklists • Zero ads
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#34d399',
            }}
          >
            www.leetmap-pro.com/company/{safeSlug}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

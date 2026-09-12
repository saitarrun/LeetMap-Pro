import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { CompanyDetail } from '@/types';

export const alt = 'LeetMap Pro Company SQL Questions';
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
  let sqlTotal = 0;
  let sqlEasy = 0;
  let sqlMedium = 0;
  let sqlHard = 0;

  if (fs.existsSync(filePath)) {
    try {
      const company: CompanyDetail = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      companyName = company.name;
      sqlTotal = company.sqlTotal || 0;
      sqlEasy = company.sqlEasy || 0;
      sqlMedium = company.sqlMedium || 0;
      sqlHard = company.sqlHard || 0;
    } catch {
      // Fallback
    }
  }

  const sqlConcepts = ['Window Functions', 'CTEs & Subqueries', 'Joins & Aggregations', 'Self Joins'];

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
        {/* Glow Accents: Cyan & Emerald */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0) 70%)',
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
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%)',
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
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.35)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#38bdf8',
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#7dd3fc',
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
              SQL & Database Matrix
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
            <span>Real Interview Frequencies</span>
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
                color: '#38bdf8',
              }}
            >
              SQL Questions
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
            Top SQL & database interview questions asked at {companyName} for Data Engineering, Data Science, and Backend Engineering roles.
          </p>

          {/* Metrics Row */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '16px',
            }}
          >
            {/* Metric 1: Total SQL */}
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
                SQL Queries
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
                {sqlTotal}
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
                SQL Difficulty
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{sqlEasy}</span>
                  <span style={{ fontSize: 15, color: '#6ee7b7', fontWeight: 600 }}>Easy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{sqlMedium}</span>
                  <span style={{ fontSize: 15, color: '#fcd34d', fontWeight: 600 }}>Med</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{sqlHard}</span>
                  <span style={{ fontSize: 15, color: '#fca5a5', fontWeight: 600 }}>Hard</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Core SQL Topics */}
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
                Core Concepts
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {sqlConcepts.map((concept) => (
                  <div
                    key={concept}
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
                    {concept}
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
            Practice company SQL queries • CSV export • Solved progress tracking
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#38bdf8',
            }}
          >
            leetmap-pro.vercel.app/sql/{safeSlug}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

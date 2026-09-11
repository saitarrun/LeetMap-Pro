import { ImageResponse } from 'next/og';

export const alt = 'LeetMap Pro — Company Wise LeetCode & SQL Questions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Subtle glowing accents */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 70%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            marginBottom: '28px',
            fontSize: 20,
            fontWeight: 600,
            color: '#34d399',
          }}
        >
          <span>684+ Companies Verified • Free & Open Source</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <span>LeetMap</span>
          <span style={{ color: '#10b981' }}>Pro</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          Company-wise LeetCode problems ranked by real interview frequency, 22 interactive DSA coding patterns, and SQL interview hub.
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: '28px',
            marginTop: '44px',
            fontSize: 19,
            color: '#e4e4e7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: 24 }}>•</span> Google, Meta, Amazon, Microsoft
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: 24 }}>•</span> 22 DSA Patterns
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: 24 }}>•</span> Curated SQL Practice
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

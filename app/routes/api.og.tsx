import { ImageResponse } from '@vercel/og';
import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const puzzleType = url.searchParams.get('type') || 'Daily';
  const difficulty = url.searchParams.get('difficulty') || 'Medium';
  const date = url.searchParams.get('date') || '';

  const colors = ['#D40920', '#1356A2', '#F9C30F'];
  const accentColor = puzzleType === 'Daily' ? '#D40920'
    : puzzleType === 'Weekly' ? '#1356A2'
    : '#F9C30F';

  // Generate a simple Mondrian-style grid of colored rectangles
  const blocks = [
    { x: 0, y: 0, w: 480, h: 280, color: colors[0] },
    { x: 480, y: 0, w: 320, h: 180, color: colors[1] },
    { x: 800, y: 0, w: 400, h: 280, color: colors[2] },
    { x: 480, y: 180, w: 320, h: 100, color: '#F5F5F0' },
    { x: 0, y: 280, w: 280, h: 350, color: colors[1] },
    { x: 280, y: 280, w: 520, h: 200, color: '#F5F5F0' },
    { x: 800, y: 280, w: 400, h: 350, color: colors[0] },
    { x: 280, y: 480, w: 520, h: 150, color: colors[2] },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#F5F5F0',
        }}
      >
        {/* Background grid */}
        {blocks.map((block, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: block.x,
              top: block.y,
              width: block.w,
              height: block.h,
              backgroundColor: block.color,
              opacity: 0.3,
              border: '3px solid #0A0A0A',
            }}
          />
        ))}

        {/* Content overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              width: '80px',
              height: '6px',
              backgroundColor: accentColor,
              marginBottom: '24px',
            }}
          />

          <div
            style={{
              fontSize: '28px',
              fontWeight: 300,
              color: '#0A0A0A',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            MONDRIAN SHIKAKU
          </div>

          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#0A0A0A',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            {puzzleType} Puzzle
          </div>

          {date && (
            <div
              style={{
                fontSize: '24px',
                color: '#555555',
                marginBottom: '12px',
              }}
            >
              {date}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 24px',
              border: '3px solid #0A0A0A',
              backgroundColor: accentColor,
              color: accentColor === '#F9C30F' ? '#0A0A0A' : '#F5F5F0',
              fontSize: '20px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {difficulty}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

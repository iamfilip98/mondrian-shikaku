export function meta() {
  return [
    { title: 'About — Mondrian Shikaku' },
    {
      name: 'description',
      content:
        'Mondrian Shikaku combines the logic of Shikaku puzzles with the aesthetic vision of Piet Mondrian. Learn about the project.',
    },
    { property: 'og:title', content: 'About — Mondrian Shikaku' },
    {
      property: 'og:description',
      content: 'The story behind Mondrian Shikaku — where logic meets art.',
    },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

export default function About() {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">
      <h1
        className="mb-8"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text)',
        }}
      >
        About Mondrian Shikaku
      </h1>

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-normal)',
          color: 'var(--color-text)',
        }}
      >
        <p className="mb-6">
          Mondrian Shikaku is a logic puzzle game that draws its visual language from Piet Mondrian's
          De Stijl paintings. The game takes Shikaku — a classic Japanese grid puzzle — and presents
          it through the lens of Mondrian's compositional philosophy: primary colours, thick black
          lines, and pure rectangular geometry.
        </p>

        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-6"
          style={{ borderLeftWidth: '6px', borderLeftColor: 'var(--color-red)' }}
        >
          <h2
            className="mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
            }}
          >
            The Rule
          </h2>
          <p>
            Divide the grid into non-overlapping rectangles. Each rectangle must contain exactly one
            number, and that number must equal the rectangle's area (width × height). Every cell
            belongs to exactly one rectangle.
          </p>
        </div>

        <h2
          className="mb-3 mt-8"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
          }}
        >
          Why Mondrian?
        </h2>
        <p className="mb-6">
          Piet Mondrian spent decades refining a visual language built on horizontal and vertical
          lines, primary colours, and the interplay of proportioned rectangles. Shikaku is,
          structurally, the same exercise: dividing a plane into rectangles according to precise
          constraints. The connection is not merely aesthetic — it is mathematical. Both demand that
          every region be exactly right, that no space be wasted, and that the composition hold
          together as a unified whole.
        </p>

        <h2
          className="mb-3 mt-8"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
          }}
        >
          Design Philosophy
        </h2>
        <p className="mb-6">
          Every design decision in Mondrian Shikaku serves the puzzle. There are no rounded corners,
          no gradients, no soft shadows. Every shadow is a hard geometric offset. Every colour is
          from Mondrian's palette. The interface is a grid — because the game is a grid.
        </p>
        <p className="mb-6">
          We believe that a puzzle game should feel like a tool for thought. The interface should
          disappear into the problem. The colours should reward correct logic. The animations
          should confirm, not distract.
        </p>

        <h2
          className="mb-3 mt-8"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
          }}
        >
          Five Difficulty Tiers
        </h2>
        <p className="mb-6">
          From 6×6 Easy puzzles to 40×40 Nightmare grids that demand
          sustained concentration and zooming navigation. Difficulty is measured not just by grid
          size, but by the logical complexity required to solve — specifically, the number of
          backtracking decisions the solver must make. An Easy puzzle requires minimal guessing. A
          Nightmare puzzle requires dozens of tentative decisions.
        </p>

        <h2
          className="mb-3 mt-8"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
          }}
        >
          Daily, Weekly, Monthly
        </h2>
        <p className="mb-6">
          Every day, every week, every month: a new puzzle for the world. Same seed, same puzzle,
          for every player everywhere. Compete on leaderboards. Make the Hall of Fame. The Monthly
          Nightmare is a 40×40 grid — 1,600 cells of pure logic. Only the most dedicated will
          finish.
        </p>

        <div
          className="border-t-2 border-[var(--color-border)] pt-6 mt-8"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Built with care. Logic is an art form.
        </div>
      </div>
    </div>
  );
}

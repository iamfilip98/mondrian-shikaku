import { useParams } from 'react-router';
import { Link } from 'react-router';

interface Article {
  title: string;
  date: string;
  readTime: string;
  accent: string;
  description: string;
  keywords: string;
  content: string;
  jsonLd: object;
}

const articles: Record<string, Article> = {
  'how-to-solve-shikaku': {
    title: 'How to Solve Shikaku — A Complete Beginner\'s Guide',
    date: '2026-02-01',
    readTime: '8 min read',
    accent: 'var(--color-red)',
    description: 'Learn how to solve Shikaku puzzles with this complete beginner guide. Master the single rule, find forced rectangles, and develop logical deduction strategies.',
    keywords: 'how to solve shikaku, shikaku tutorial, shikaku guide, shikaku beginner',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a Shikaku puzzle?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Shikaku is a logic puzzle where you divide a rectangular grid into non-overlapping rectangles. Each rectangle must contain exactly one number, and that number must equal the area (width × height) of the rectangle. Every cell in the grid must belong to exactly one rectangle.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I start solving a Shikaku puzzle?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start by looking for forced rectangles — numbers that can only form one possible rectangle given their position and the surrounding constraints. Corner numbers and edge numbers often have fewer possibilities than center numbers.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does the number in a Shikaku cell mean?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each number represents the area of the rectangle that must contain it. For example, a 6 means the rectangle must have an area of 6 cells — it could be 2×3, 3×2, 1×6, or 6×1.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can Shikaku puzzles be solved without guessing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Well-designed Shikaku puzzles at easier difficulty levels can be solved purely through logical deduction. Harder puzzles may require making tentative decisions and backtracking if they lead to contradictions, but this is still logic — not random guessing.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are the best strategies for Shikaku?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Key strategies include: (1) Start with numbers that have only one possible rectangle, (2) Use corners and edges where rectangles are constrained, (3) Look for numbers that would be blocked if a particular rectangle were placed, (4) Use process of elimination when multiple numbers interact.',
          },
        },
      ],
    },
    content: `
## What Is Shikaku?

Shikaku is a logic puzzle played on a rectangular grid. Some cells contain numbers. Your task is to divide the entire grid into non-overlapping rectangles, where each rectangle contains exactly one number equal to its area. Every cell must belong to exactly one rectangle.

That is the entire rule. One sentence. No exceptions, no special cases.

The name "Shikaku" comes from the Japanese word for "rectangle" (四角), and the puzzle is sometimes called "Divide by Squares" or "Rectangles." It was popularized by the Japanese puzzle publisher Nikoli, the same company that brought Sudoku to the world.

## The Single Rule in Detail

Let us be precise about what the rule means:

- **Non-overlapping**: No two rectangles may share any cell. Every cell belongs to exactly one rectangle.
- **Exactly one number**: Each rectangle you draw must contain precisely one number inside it. Not zero, not two — exactly one.
- **Area equals the number**: If a rectangle contains the number 6, then the rectangle must have an area of 6 cells. This means it could be 2×3, 3×2, 1×6, or 6×1.
- **Complete coverage**: When you are finished, every cell in the grid must be inside a rectangle. No empty spaces.

## How to Find Forced Rectangles

The most powerful technique in Shikaku is identifying **forced rectangles** — numbers where only one valid rectangle is possible.

### Corner Logic

A number in the corner of the grid is the most constrained. Consider a "2" in the top-left corner. It must form a rectangle of area 2 containing that cell. The only options are a 1×2 going right or a 2×1 going down. If one of those directions is blocked by another rectangle, the other is forced.

\`\`\`
┌───┬───┬───┬───┐
│ 2 │   │   │   │
├───┼───┼───┼───┤
│   │   │   │   │
├───┼───┼───┼───┤
│   │   │   │   │
└───┴───┴───┴───┘
\`\`\`

The "2" in the top-left can only be 1×2 (right) or 2×1 (down).

### Edge Logic

Numbers along edges have fewer degrees of freedom than numbers in the center. A "3" along the top edge can only extend in three directions: right, down, or left. It cannot extend upward. This constraint often forces specific orientations.

\`\`\`
┌───┬───┬───┬───┬───┐
│   │   │ 3 │   │   │
├───┼───┼───┼───┼───┤
│   │   │   │   │   │
├───┼───┼───┼───┼───┤
│   │   │   │   │   │
└───┴───┴───┴───┴───┘
\`\`\`

The "3" on the top edge: possible shapes are 3×1 (horizontal) or 1×3 (vertical going down).

### Process of Elimination

Sometimes a number has multiple possible rectangles, but all except one would conflict with another number's requirements. Work through each possibility systematically:

1. List all valid rectangles for a given number
2. For each candidate, check whether it would make another number unsolvable
3. Eliminate candidates that create contradictions
4. If one candidate remains, it is forced

## The Interaction Between Numbers

Shikaku becomes interesting when numbers constrain each other. Consider two adjacent numbers:

\`\`\`
┌───┬───┬───┬───┐
│   │ 4 │ 2 │   │
├───┼───┼───┼───┤
│   │   │   │   │
├───┼───┼───┼───┤
│   │   │   │   │
└───┴───┴───┴───┘
\`\`\`

The "4" and "2" are adjacent. Each must be in a separate rectangle. The "4" could be 2×2, 4×1, or 1×4. The "2" could be 2×1 or 1×2. But they cannot overlap! So if the "4" extends rightward to cover the "2"'s cell, that violates the rule. This interaction narrows both numbers' possibilities.

## Solving Step by Step

Here is a systematic approach to solving any Shikaku puzzle:

**Step 1: Scan for forced moves.** Look at every number, especially corners and edges. Find any number with only one valid rectangle. Place those first.

**Step 2: Re-scan after each placement.** Every rectangle you place changes the landscape. Cells are now claimed. Other numbers may now have fewer possibilities. Repeat step 1.

**Step 3: Use "what if" reasoning for harder puzzles.** When no number has a single forced rectangle, choose the most constrained number (fewest options). Try one option. See if it leads to a contradiction — if another number becomes unsolvable. If so, that option is eliminated.

**Step 4: Fill remaining spaces.** As the puzzle fills, unclaimed cells form smaller and smaller regions. Numbers within those regions become easier to resolve because their rectangles must fit within the remaining space.

## Common Mistakes

- **Forgetting complete coverage**: Every cell must be inside a rectangle. Leaving gaps means the solution is incomplete.
- **Creating rectangles with no number**: A rectangle must contain exactly one number. You cannot draw arbitrary rectangles in empty regions unless they contain a number.
- **Miscounting area**: A 2×3 rectangle has area 6, not 5. Count carefully, especially with larger rectangles.
- **Ignoring distant numbers**: A rectangle for a large number (say 12) might extend across a significant portion of the grid. Consider these large rectangles first, as they constrain the most space.

## From Beginner to Expert

As you advance, you will develop intuition for:

- **Parity arguments**: In certain configurations, the grid's geometry forces specific orientations.
- **Space partitioning**: Recognizing that a region of the grid can only be divided in specific ways.
- **Chain reasoning**: A placement here forces a placement there, which forces another placement, creating a chain of logical deductions.

The beauty of Shikaku is that all of this emerges from a single rule. No memorization. No formulas. Just spatial logic applied to a grid of rectangles.

Start with small grids. The Primer difficulty (4×4 to 5×5) is designed to be immediately approachable. Each puzzle teaches through doing, not through explanation. Once the rule clicks — and it will, within your first completed puzzle — everything else follows from logic.
    `,
  },
  'mondrian-and-logic': {
    title: 'Piet Mondrian and the Logic of Rectangular Grids',
    date: '2026-02-10',
    readTime: '10 min read',
    accent: 'var(--color-blue)',
    description: 'Explore the connection between Piet Mondrian\'s De Stijl paintings and the logic of Shikaku puzzles. Art and mathematics share a common language.',
    keywords: 'Mondrian puzzle game, Piet Mondrian, De Stijl, neoplasticism, Mondrian art',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Piet Mondrian and the Logic of Rectangular Grids',
      author: { '@type': 'Organization', name: 'Mondrian Shikaku' },
      datePublished: '2026-02-10',
      description: 'Explore the connection between Piet Mondrian\'s De Stijl paintings and the logic of Shikaku puzzles.',
    },
    content: `
## The Painter of Pure Relations

Pieter Cornelis Mondriaan — who later simplified his name to Piet Mondrian — was born in Amersfoort, the Netherlands, in 1872. Over the course of five decades, he traveled one of the most remarkable artistic journeys in modern art: from traditional Dutch landscape painting, through Cubism and abstraction, to a radical visual language of pure horizontal and vertical lines, primary colours, and rectangular planes.

By the time of his mature work in the 1920s and 1930s, Mondrian had stripped painting down to what he called its "pure plastic means": straight lines meeting at right angles, rectangles of varying proportions, and only three colours — red, yellow, and blue — against fields of white and black. He called this approach **Neoplasticism** (Nieuwe Beelding), and it was not merely an aesthetic preference. It was, in his mind, a philosophy of universal harmony.

## De Stijl: The Style That Was Not a Style

In 1917, Mondrian co-founded the art movement **De Stijl** ("The Style") with Theo van Doesburg and several other artists and architects. The movement's ambition was to erase the boundary between art and life by applying abstract geometric principles to everything: painting, architecture, furniture, typography, urban planning.

De Stijl's visual vocabulary was deliberate in its restrictions:

- Only horizontal and vertical lines
- Only right angles
- Only primary colours plus black, white, and grey
- Asymmetric compositions (never centered, never symmetric)

These were not limitations — they were liberations. By removing every curve, every diagonal, every secondary colour, De Stijl aimed to reach a visual language so fundamental that it transcended individual taste or cultural context.

## Composition II in Red, Blue, and Yellow (1930)

Mondrian's most recognized work, *Composition II in Red, Blue, and Yellow*, hangs in the Kunsthaus Zürich. It features a large red rectangle dominating the upper-left quadrant, a smaller blue rectangle in the lower-right corner, and a tiny yellow rectangle in the lower-left corner. Thick black lines divide the white canvas into rectangular regions.

What makes this painting compelling is not the colours — it is the **proportions**. The red rectangle is large. The blue is small. The yellow is tiny. The white regions vary in size. Nothing is centered. Nothing is equal. And yet the composition holds together with a tension that feels resolved — not static, but balanced through asymmetry.

This is exactly the quality that makes a Shikaku puzzle satisfying to solve: the grid fills with rectangles of different sizes and proportions, creating an asymmetric composition where every region is precisely determined, every boundary is necessary, and the whole is greater than the parts.

## Broadway Boogie Woogie (1942–1943)

In his final years in New York, Mondrian produced *Broadway Boogie Woogie*, a painting that replaced the black grid lines with lines made of small coloured squares — yellow, red, and blue — inspired by the rhythmic energy of Manhattan's street grid and the boogie-woogie jazz he loved.

This painting is essentially a grid puzzle. The coloured lines form a lattice. The rectangles between them vary in size and colour. The overall effect is vibrant and rhythmic — a grid system brought to life through variation within strict constraints.

## Shikaku as Mondrian's Logic

Here is where the connection to Shikaku becomes structural, not merely decorative.

A Shikaku puzzle is a rectangular grid that must be divided into non-overlapping rectangles. Each rectangle has a precise size determined by the number it contains. The solution is a partition of the plane into rectangles — exactly what Mondrian was doing on canvas.

Consider what both activities share:

**1. Complete coverage.** In a Mondrian painting, every part of the canvas belongs to a rectangular region (even the "white" spaces are deliberate rectangles). In Shikaku, every cell must belong to exactly one rectangle. No gaps, no waste.

**2. Asymmetric proportion.** Mondrian never made his rectangles equal in size. The drama of his compositions comes from the tension between large and small regions. In Shikaku, the numbers dictate rectangles of varying areas — 2, 3, 6, 12 — creating the same visual asymmetry.

**3. Constraint as freedom.** Mondrian imposed severe constraints on himself — no diagonals, no curves, only primary colours — and found infinite compositional variety within those constraints. Shikaku imposes a single rule and generates infinite variety. The constraint is not a cage; it is the engine of creativity.

**4. Black borders define regions.** In Mondrian's work, thick black lines separate colour fields. In Shikaku, the grid lines (and the boundaries of solved rectangles) create the same visual structure.

**5. Resolution through logic.** Mondrian spent days, sometimes weeks, adjusting the width of a single line or the proportion of a rectangle. He described this as finding the "equilibrium" of a composition. A Shikaku solver does the same — each rectangle must be placed not only correctly for its own clue, but in harmony with every other rectangle on the grid. The puzzle resolves when every constraint is simultaneously satisfied.

## The Mathematics Behind Both

There is a field of mathematics called the **Mondrian puzzle** — named directly after the painter. The Mondrian puzzle asks: given an n×n grid, divide it into non-overlapping rectangles such that the difference between the largest and smallest rectangle areas is minimized. This is a legitimate area of combinatorial mathematics research.

Shikaku is a related but different problem. Instead of minimizing area difference, Shikaku fixes each rectangle's area via numbered clues and asks for a partition that satisfies all constraints simultaneously. It is a **constraint satisfaction problem** (CSP), the same class of problems that includes Sudoku and the Boolean satisfiability problem (SAT).

Both the mathematical Mondrian puzzle and Shikaku sit at the intersection of geometry, combinatorics, and constraint theory. Both ask: how many ways can a rectangle be partitioned? Under what conditions is the partition unique? What makes one partition more "balanced" (or more "beautiful") than another?

## Beyond Aesthetics

It would be easy to dismiss the Mondrian–Shikaku connection as a surface-level aesthetic choice — we like the look of primary colours and black grids, so we themed a puzzle game after it.

But the connection runs deeper. Mondrian was not decorating. He was solving a compositional problem: how to divide a bounded rectangular space into regions that are individually correct and collectively balanced. That is a description of Shikaku.

When you solve a Shikaku puzzle and see the grid fill with red, yellow, and blue rectangles — bounded by strong lines, asymmetric in proportion, complete in coverage — you are not just playing a game that looks like a Mondrian painting. You are performing the same operation Mondrian performed: dividing a plane into rectangles according to constraints, searching for the unique solution where every part is in its right place.

Logic is, in this precise sense, an art form.
    `,
  },
  'mathematics-of-shikaku': {
    title: 'The Mathematics Behind Shikaku Puzzles',
    date: '2026-02-15',
    readTime: '12 min read',
    accent: 'var(--color-yellow)',
    description: 'Explore the computer science and mathematics behind Shikaku puzzles: constraint satisfaction, NP-completeness, and how backtracking depth measures difficulty.',
    keywords: 'shikaku mathematics logic puzzle, constraint satisfaction, NP-complete, puzzle mathematics',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'The Mathematics Behind Shikaku Puzzles',
      author: { '@type': 'Organization', name: 'Mondrian Shikaku' },
      datePublished: '2026-02-15',
      description: 'The computer science and mathematics behind Shikaku puzzles.',
    },
    content: `
## Shikaku as a Constraint Satisfaction Problem

In computer science, a **constraint satisfaction problem** (CSP) consists of three components: a set of variables, a set of domains (possible values for each variable), and a set of constraints that restrict which combinations of values are valid.

Shikaku maps naturally to this framework:

- **Variables**: Each numbered clue is a variable. Its value is the specific rectangle assigned to it.
- **Domain**: For a clue with value N at position (r, c), the domain is the set of all rectangles with area N that contain the cell (r, c) and fit within the grid boundaries.
- **Constraints**: (1) No two rectangles may overlap. (2) Each rectangle contains exactly one clue. (3) Every cell is covered by exactly one rectangle.

This formulation immediately places Shikaku in the same mathematical family as Sudoku, crossword construction, graph colouring, and scheduling problems. All are CSPs with different variable structures and constraint types, but they share the same fundamental solving approach: search with constraint propagation.

## The Complexity Class: NP-Complete

A natural question arises: how hard is Shikaku? Not "how hard is this particular puzzle," but "how hard is the general problem of solving Shikaku puzzles?"

The answer, proven by Ueda and Nagao in 2001, is that Shikaku is **NP-complete**. This means:

1. **In NP**: Given a proposed solution, we can verify its correctness in polynomial time. (Just check that every rectangle has the right area, contains exactly one matching clue, and no overlaps exist.)

2. **NP-hard**: Solving a general Shikaku instance is at least as hard as any other problem in NP. No known algorithm can solve all Shikaku puzzles in polynomial time relative to the grid size.

This is the same complexity class as Sudoku, the Traveling Salesman Problem (decision version), Boolean satisfiability, and graph colouring. In practical terms, it means that as puzzles get larger, the worst-case solving time grows exponentially.

However — and this is crucial — NP-completeness describes worst-case complexity for the general problem. Well-designed puzzles can be significantly easier than the worst case, and this is exactly how puzzle designers create enjoyable difficulty curves.

## Constraint Propagation: The Engine of Easy Puzzles

Before resorting to search, a good Shikaku solver applies **constraint propagation** — reducing each variable's domain by reasoning about the constraints.

The most basic form is **arc consistency**: for each clue, eliminate any rectangle from its domain that would necessarily conflict with another clue's possibilities. If a rectangle for clue A would make it impossible for clue B to have any valid rectangle, then that rectangle is not a valid option for A.

More powerful propagation techniques exist:

**Forced placement**: If a clue has only one rectangle remaining in its domain, that rectangle is forced. Place it and propagate the consequences (other clues' domains shrink because cells are now claimed).

**Naked singles**: If a cell can only be covered by one clue's rectangle, that rectangle is forced.

**Hidden singles**: If within a region, only one clue can cover a particular cell, that clue's rectangle must cover that cell.

When propagation alone resolves every clue, the puzzle requires **zero backtracking**. These are the puzzles we classify as "Primer" or "Easy" — solvable by pure logical deduction.

## Backtracking: The Measure of Difficulty

When constraint propagation reaches a dead end — no more forced placements, but the puzzle is not solved — the solver must **guess**. It picks the most constrained unresolved clue (the one with the fewest remaining rectangle options), tries one option, and recurses. If the choice leads to a contradiction (some other clue becomes unsolvable), the solver **backtracks** — undoes the guess and tries the next option.

The number of backtracks required to solve a puzzle is a precise, measurable quantity. It directly captures the puzzle's logical difficulty:

| Backtracks | Difficulty | Experience |
|-----------|-----------|-----------|
| 0 | Primer / Easy | Pure deduction. Every move is forced. |
| 1–5 | Medium | A few decision points, but contradictions are quickly found. |
| 6–20 | Hard | Sustained chains of tentative reasoning. |
| 21–50 | Expert | Deep search trees. Multiple nested decisions. |
| 51+ | Nightmare | Extended exploration of large possibility spaces. |

This metric is elegant because it is **objective**. Two different people can argue about whether a Sudoku is "hard" or "medium." But the backtrack count of a Shikaku puzzle, given a standardized solver, is a fixed number. It is the same for everyone.

## Why Unique Solutions Matter

A valid Shikaku puzzle must have exactly one solution. This is not a stylistic choice — it is a mathematical requirement for the puzzle to be logically solvable.

If a puzzle has multiple solutions, then at some point during solving, a player faces a choice that cannot be resolved by logic alone. Both options are valid. The player must simply guess — not as a tentative hypothesis that can be refuted, but as an arbitrary choice between equally correct alternatives. This is unsatisfying because it breaks the contract that logic will guide you to the answer.

Uniqueness is also what makes puzzle generation mathematically interesting. Given a set of rectangles partitioning a grid, the generator must choose clue positions that produce exactly one solution. Too few clues, or poorly positioned clues, and the puzzle becomes ambiguous. Our generator verifies uniqueness by running the solver and checking that it finds exactly one solution.

## The Solution Space

For a grid of size n × m, the number of possible rectangle partitions grows super-exponentially. Even for modest grid sizes, the solution space is vast:

- A 4×4 grid has approximately 15,000 distinct partitions into rectangles
- A 10×10 grid has billions
- A 40×40 grid has a number so large it defies meaningful notation

The clue numbers act as constraints that collapse this enormous space down to (ideally) a single point — the unique solution. The art of puzzle design is choosing the right clue numbers and positions to create a puzzle that is:

1. Uniquely solvable (exactly one partition satisfies all clues)
2. Appropriately difficult (the solver requires the target number of backtracks)
3. Aesthetically pleasing (the rectangles form an interesting composition)

## The Graph Colouring Connection

Once a Shikaku puzzle is solved, the rectangles must be coloured for display. This introduces another classic mathematical problem: **graph colouring**.

Build a graph where each rectangle is a node, and two nodes are connected by an edge if their rectangles share a border. The goal is to assign colours to nodes such that no two adjacent nodes share a colour.

By the **four colour theorem** (proven by Appel and Haken in 1976, later verified by computer-checked formal proof), any planar graph can be coloured with at most four colours. Since the rectangle adjacency graph of a Shikaku solution is always planar, four colours always suffice.

In practice, we use a greedy algorithm with three colours (Mondrian's red, yellow, and blue), which works well for most configurations. When three colours create a conflict (which is rare in typical Shikaku layouts), the algorithm falls back gracefully.

## Seeded Deterministic Generation

For our daily, weekly, and monthly puzzles, we need every player worldwide to receive the same puzzle. We achieve this through **seeded pseudorandom number generation**.

A pseudorandom number generator (PRNG) produces a sequence of numbers that appears random but is entirely determined by an initial **seed** value. Given the same seed, the PRNG always produces the same sequence.

We use the Mulberry32 algorithm — a 32-bit PRNG with excellent statistical properties and minimal state. The seed is derived from a date string (e.g., "daily-2026-02-21"), which means:

- The same date always produces the same puzzle
- Different dates produce completely different puzzles
- No server-side generation is needed — the puzzle is computed client-side
- Every player gets the same puzzle because they use the same seed

This is a beautiful application of deterministic computation: randomness that is reproducible, distributed without coordination, and verifiable by anyone.

## Measuring What Matters

The mathematical machinery behind Shikaku — constraint propagation, backtracking search, graph colouring, deterministic generation — is invisible to the player. And that is exactly the point. The mathematics is not the experience; it is the infrastructure that makes the experience possible.

What the player experiences is the satisfaction of logical deduction: the moment when a chain of reasoning clicks into place and a rectangle is forced. That feeling — the certainty that this rectangle must go here, and nowhere else — is the product of a constraint system doing its work. The mathematics guarantees that the feeling is trustworthy.

Every number has a reason. Every rectangle has a unique home. Every puzzle has a unique solution. The mathematics promises this, and the player discovers it. Logic is an art form because it rewards the same qualities that art rewards: attention, patience, and the willingness to see what is actually there.
    `,
  },
};

export function meta({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];
  if (!article) {
    return [{ title: '404 — Mondrian Shikaku' }];
  }
  return [
    { title: `${article.title} — Mondrian Shikaku` },
    { name: 'description', content: article.description },
    { name: 'keywords', content: article.keywords },
    { property: 'og:title', content: article.title },
    { property: 'og:description', content: article.description },
    { property: 'og:type', content: 'article' },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

export default function BlogArticle() {
  const { slug } = useParams();
  const article = slug ? articles[slug] : null;

  if (!article) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-12 text-center">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text)' }}>
          Article Not Found
        </h1>
        <p className="mt-4" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          <Link to="/blog" style={{ color: 'var(--color-blue)' }}>Back to Blog</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article.jsonLd) }}
      />

      {/* Back link */}
      <Link
        to="/blog"
        className="inline-block mb-6"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        ← Blog
      </Link>

      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {article.date}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            · {article.readTime}
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text)',
            lineHeight: 'var(--leading-tight)',
          }}
        >
          {article.title}
        </h1>
      </div>

      {/* Article content */}
      <article
        className="prose"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-normal)',
          color: 'var(--color-text)',
        }}
      >
        {article.content.split('\n\n').map((block, i) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={i}
                className="mt-10 mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--color-text)',
                }}
              >
                {trimmed.slice(3)}
              </h2>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={i}
                className="mt-8 mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text)',
                }}
              >
                {trimmed.slice(4)}
              </h3>
            );
          }

          if (trimmed.startsWith('```')) {
            const code = trimmed.replace(/```\w*\n?/, '').replace(/\n?```$/, '');
            return (
              <pre
                key={i}
                className="my-4 p-4 overflow-x-auto border-2 border-[var(--color-border)] bg-[var(--color-surface)]"
                style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}
              >
                <code>{code}</code>
              </pre>
            );
          }

          if (trimmed.startsWith('|')) {
            const rows = trimmed.split('\n').filter((r) => r.trim() && !r.match(/^\|[\s-|]+\|$/));
            return (
              <div key={i} className="my-4 overflow-x-auto">
                <table className="w-full border-2 border-[var(--color-border)]">
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'bg-[var(--color-surface)]' : ''}>
                        {row
                          .split('|')
                          .filter(Boolean)
                          .map((cell, ci) => {
                            const Tag = ri === 0 ? 'th' : 'td';
                            return (
                              <Tag
                                key={ci}
                                className="px-3 py-2 border border-[var(--color-border-muted)] text-left"
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                {cell.trim()}
                              </Tag>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = trimmed.split('\n');
            return (
              <ul key={i} className="my-3 ml-6 list-disc" style={{ fontSize: 'var(--text-base)' }}>
                {items.map((item, ii) => (
                  <li key={ii} className="mb-1">{item.replace(/^[-*]\s+/, '')}</li>
                ))}
              </ul>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            const items = trimmed.split('\n');
            return (
              <ol key={i} className="my-3 ml-6 list-decimal" style={{ fontSize: 'var(--text-base)' }}>
                {items.map((item, ii) => (
                  <li key={ii} className="mb-1">{item.replace(/^\d+\.\s+/, '')}</li>
                ))}
              </ol>
            );
          }

          // Format bold and inline code
          const formatted = trimmed
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code style="background:var(--color-surface);padding:1px 4px;border:1px solid var(--color-border-muted);font-size:var(--text-sm)">$1</code>');

          return (
            <p
              key={i}
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        })}
      </article>

      {/* Bottom nav */}
      <div className="mt-12 pt-6 border-t-2 border-[var(--color-border)]">
        <Link
          to="/blog"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-blue)',
          }}
        >
          ← All Articles
        </Link>
      </div>
    </div>
  );
}

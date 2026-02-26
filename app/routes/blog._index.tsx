import { Link } from 'react-router';
import { motion } from 'framer-motion';

export function meta() {
  return [
    { title: 'Blog — Mondrian Shikaku' },
    {
      name: 'description',
      content: 'Articles about Shikaku puzzles, Piet Mondrian, and the mathematics behind logic puzzles.',
    },
    { property: 'og:title', content: 'Blog — Mondrian Shikaku' },
    { property: 'og:description', content: 'Articles about Shikaku puzzles, Piet Mondrian, and the mathematics behind logic puzzles.' },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

const articles = [
  {
    slug: 'how-to-solve-shikaku',
    title: 'How to Solve Shikaku — A Complete Beginner\'s Guide',
    excerpt: 'Learn the fundamentals of Shikaku puzzles. From the single rule to advanced deduction techniques.',
    accent: 'var(--color-red)',
    date: '2026-02-01',
    readTime: '8 min read',
  },
  {
    slug: 'mondrian-and-logic',
    title: 'Piet Mondrian and the Logic of Rectangular Grids',
    excerpt: 'Why Shikaku is a natural mirror of Mondrian\'s compositional philosophy — not just an aesthetic choice.',
    accent: 'var(--color-blue)',
    date: '2026-02-10',
    readTime: '10 min read',
  },
  {
    slug: 'mathematics-of-shikaku',
    title: 'The Mathematics Behind Shikaku Puzzles',
    excerpt: 'Constraint satisfaction, NP-completeness, and how backtracking depth measures difficulty.',
    accent: 'var(--color-yellow)',
    date: '2026-02-15',
    readTime: '12 min read',
  },
];

export default function BlogIndex() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <h1
        className="mb-10"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text)',
        }}
      >
        Blog
      </h1>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: '1fr',
        }}
      >
        {articles.map((article) => (
          <Link key={article.slug} to={`/blog/${article.slug}`}>
            <motion.article
              className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-sharp p-6"
              style={{
                borderLeftWidth: '6px',
                borderLeftColor: article.accent,
              }}
              whileHover={{
                y: -2,
                boxShadow: '6px 6px 0px 0px var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {article.date}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  · {article.readTime}
                </span>
              </div>
              <h2
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--color-text)',
                }}
              >
                {article.title}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-normal)',
                }}
              >
                {article.excerpt}
              </p>
            </motion.article>
          </Link>
        ))}
      </div>
    </div>
  );
}

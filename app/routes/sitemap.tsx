export function loader() {
  const baseUrl = 'https://mondrianshikaku.com';

  const routes = [
    '',
    '/play',
    '/daily',
    '/weekly',
    '/monthly',
    '/leaderboard',
    '/hall-of-fame',
    '/blog',
    '/blog/how-to-solve-shikaku',
    '/blog/mondrian-and-logic',
    '/blog/mathematics-of-shikaku',
    '/about',
    '/login',
    '/signup',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

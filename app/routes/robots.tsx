export function loader() {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://mondrianshikaku.com/sitemap.xml`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

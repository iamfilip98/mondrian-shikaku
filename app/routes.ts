import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('play', 'routes/play.tsx'),
  route('daily', 'routes/daily.tsx'),
  route('weekly', 'routes/weekly.tsx'),
  route('monthly', 'routes/monthly.tsx'),
  route('leaderboard', 'routes/leaderboard.tsx'),
  route('hall-of-fame', 'routes/hall-of-fame.tsx'),
  route('blog', 'routes/blog._index.tsx'),
  route('blog/:slug', 'routes/blog.$slug.tsx'),
  route('about', 'routes/about.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('login', 'routes/login.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('sitemap.xml', 'routes/sitemap.tsx'),
  route('robots.txt', 'routes/robots.tsx'),
  route('api/solve', 'routes/api.solve.tsx'),
  route('api/profile/create', 'routes/api.profile.create.tsx'),
  route('api/profile/update', 'routes/api.profile.update.tsx'),
  route('api/cron/archive-hof', 'routes/api.cron.archive-hof.tsx'),
] satisfies RouteConfig;

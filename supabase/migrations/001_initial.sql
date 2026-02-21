-- Profiles (extends auth.users)
create table profiles (
  id                uuid references auth.users primary key,
  username          text unique not null,
  avatar_color      text default '#D40920',
  theme             text default 'system'
                      check (theme in ('light','dark','system')),
  blind_mode        boolean default false,
  sound_enabled     boolean default true,
  show_timer        boolean default true,
  unlocked_colors   text[] default array['red'],
  puzzles_completed int default 0,
  daily_streak      int default 0,
  longest_streak    int default 0,
  last_daily_date   date,
  created_at        timestamptz default now()
);

-- Solves
create table solves (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references profiles(id),
  puzzle_type         text not null
                        check (puzzle_type in ('daily','weekly','monthly','free')),
  puzzle_seed         text not null,
  difficulty          text not null
                        check (difficulty in
                          ('primer','easy','medium','hard','expert','nightmare')),
  grid_width          int not null,
  grid_height         int not null,
  solve_time_seconds  int not null,
  hints_used          int default 0,
  blind_mode_on       boolean default false,
  completed_at        timestamptz default now()
);

-- Hall of Fame
create table hall_of_fame (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),
  puzzle_seed     text not null,
  month_year      text not null,
  rank            int not null check (rank in (1,2,3)),
  solve_time_secs int not null,
  grid_svg        text,
  archived_at     timestamptz default now()
);

-- Indexes
create index solves_user_idx       on solves(user_id);
create index solves_seed_type_idx  on solves(puzzle_seed, puzzle_type);
create index solves_completed_idx  on solves(completed_at desc);
create index hof_month_idx         on hall_of_fame(month_year);

-- Daily leaderboard view
create view leaderboard_daily as
  select p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  from solves s join profiles p on p.id = s.user_id
  where s.puzzle_type = 'daily'
    and s.puzzle_seed = to_char(current_date, 'YYYY-MM-DD')
  order by s.solve_time_seconds asc
  limit 100;

-- Weekly leaderboard view
create view leaderboard_weekly as
  select p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  from solves s join profiles p on p.id = s.user_id
  where s.puzzle_type = 'weekly'
    and date_trunc('week', s.completed_at) = date_trunc('week', now())
  order by s.solve_time_seconds asc
  limit 100;

-- Monthly leaderboard view
create view leaderboard_monthly as
  select p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  from solves s join profiles p on p.id = s.user_id
  where s.puzzle_type = 'monthly'
    and date_trunc('month', s.completed_at) = date_trunc('month', now())
  order by s.solve_time_seconds asc
  limit 100;

-- All-time leaderboard view
create view leaderboard_alltime as
  select p.username, p.avatar_color, s.difficulty,
         round(avg(s.solve_time_seconds))  as avg_time,
         min(s.solve_time_seconds)         as best_time,
         count(*)                          as total_solves
  from solves s join profiles p on p.id = s.user_id
  where s.hints_used = 0
  group by p.username, p.avatar_color, s.difficulty
  order by avg_time asc;

-- Row Level Security
alter table profiles     enable row level security;
alter table solves       enable row level security;
alter table hall_of_fame enable row level security;

create policy "own profile read"
  on profiles for select using (auth.uid() = id);
create policy "own profile update"
  on profiles for update using (auth.uid() = id);
create policy "own profile insert"
  on profiles for insert with check (auth.uid() = id);
create policy "own solve insert"
  on solves for insert with check (auth.uid() = user_id);
create policy "public solve read"
  on solves for select using (true);
create policy "public hof read"
  on hall_of_fame for select using (true);
create policy "service role hof insert"
  on hall_of_fame for insert with check (true);

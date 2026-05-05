-- 「假设」 MVP — initial schema
-- Maps to docs/PRD_假设_v0.2.md §7

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nickname text unique not null check (char_length(nickname) between 2 and 12),
  avatar_url text,
  is_admin boolean default false not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- categories
-- ============================================================
create table categories (
  id serial primary key,
  slug text unique not null,
  name text not null,
  color_hex text,
  display_order int default 0 not null
);

insert into categories (slug, name, color_hex, display_order) values
  ('qipashuo',   '奇葩说脑洞',   '#58CC02', 1),
  ('philosophy', '经典思想实验', '#1CB0F6', 2),
  ('either-or',  '二选一',       '#FFC800', 3),
  ('internet',   '网络流传',     '#CE82FF', 4);

-- ============================================================
-- questions
-- ============================================================
create table questions (
  id serial primary key,
  title text not null,
  description text,
  category_id int references categories(id),
  source text,
  source_detail text,
  side_a_label text default '支持' not null,
  side_b_label text default '反对' not null,
  status text default 'published' not null
    check (status in ('draft', 'published', 'archived')),
  is_daily boolean default false not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- votes (one row per (user, question), side may be updated)
-- ============================================================
create table votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  question_id int references questions(id) on delete cascade not null,
  initial_side char(1) not null check (initial_side in ('a', 'b')),
  current_side char(1) not null check (current_side in ('a', 'b')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, question_id)
);

-- ============================================================
-- stance_changes (audit trail of side flips)
-- ============================================================
create table stance_changes (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references votes(id) on delete cascade not null,
  from_side char(1) not null,
  to_side char(1) not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- arguments
-- ============================================================
create table arguments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  question_id int references questions(id) on delete cascade not null,
  side char(1) not null check (side in ('a', 'b')),
  content text not null check (char_length(content) <= 200),
  likes_count int default 0 not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- argument_likes
-- ============================================================
create table argument_likes (
  user_id uuid references profiles(id) on delete cascade not null,
  argument_id uuid references arguments(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (user_id, argument_id)
);

-- Maintain arguments.likes_count via trigger
create or replace function bump_argument_likes() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update arguments set likes_count = likes_count + 1 where id = new.argument_id;
  elsif TG_OP = 'DELETE' then
    update arguments set likes_count = likes_count - 1 where id = old.argument_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trg_argument_likes_bump
  after insert or delete on argument_likes
  for each row execute function bump_argument_likes();

-- ============================================================
-- question_suggestions (user-submitted, admin-reviewed)
-- ============================================================
create table question_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 10 and 80),
  description text check (char_length(description) <= 200),
  category_id int references categories(id),
  side_a_label text default '支持' not null,
  side_b_label text default '反对' not null,
  source text,
  status text default 'pending' not null
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  reviewer_id uuid references profiles(id),
  approved_question_id int references questions(id),
  created_at timestamptz default now() not null,
  reviewed_at timestamptz
);

-- ============================================================
-- indexes
-- ============================================================
create index idx_arguments_question_side_likes
  on arguments(question_id, side, likes_count desc);
create index idx_votes_user on votes(user_id);
create index idx_suggestions_status_created
  on question_suggestions(status, created_at desc);
create index idx_suggestions_user
  on question_suggestions(user_id, created_at desc);

-- ============================================================
-- Row Level Security policies
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table questions enable row level security;
alter table votes enable row level security;
alter table stance_changes enable row level security;
alter table arguments enable row level security;
alter table argument_likes enable row level security;
alter table question_suggestions enable row level security;

-- categories & questions: publicly readable (anyone, even anon, can browse)
create policy "categories_read_all" on categories for select using (true);
create policy "questions_read_published" on questions for select
  using (status = 'published');

-- profiles: anyone can read; user can update their own row (except is_admin)
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select is_admin from profiles where id = auth.uid()));
create policy "profiles_insert_self" on profiles for insert
  with check (auth.uid() = id);

-- votes: user reads their own + aggregates publicly readable via questions endpoint
create policy "votes_read_own" on votes for select using (auth.uid() = user_id);
create policy "votes_write_own" on votes for insert with check (auth.uid() = user_id);
create policy "votes_update_own" on votes for update using (auth.uid() = user_id);

-- stance_changes: read own
create policy "stance_changes_read_own" on stance_changes for select
  using (exists (select 1 from votes v where v.id = vote_id and v.user_id = auth.uid()));
create policy "stance_changes_insert_own" on stance_changes for insert
  with check (exists (select 1 from votes v where v.id = vote_id and v.user_id = auth.uid()));

-- arguments: anyone authenticated can read; user writes their own
create policy "arguments_read_all" on arguments for select using (auth.role() = 'authenticated');
create policy "arguments_write_own" on arguments for insert with check (auth.uid() = user_id);
create policy "arguments_update_own" on arguments for update using (auth.uid() = user_id);

-- argument_likes: user reads/writes own
create policy "argument_likes_read_own" on argument_likes for select using (auth.uid() = user_id);
create policy "argument_likes_write_own" on argument_likes for insert with check (auth.uid() = user_id);
create policy "argument_likes_delete_own" on argument_likes for delete using (auth.uid() = user_id);

-- question_suggestions: user sees own; admin sees all; only admin can update
create policy "suggestions_read_own_or_admin" on question_suggestions for select
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );
create policy "suggestions_insert_own" on question_suggestions for insert
  with check (auth.uid() = user_id);
create policy "suggestions_update_admin_only" on question_suggestions for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

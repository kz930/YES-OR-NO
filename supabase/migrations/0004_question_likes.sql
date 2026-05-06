-- Likes on the question itself (separate from voting yes/no on its content,
-- and separate from liking individual arguments/comments).
-- Use case: signals "this is a fun/interesting question" — feeds the
-- "most-liked" sort on /explore and gives suggestion submitters credit.

create table question_likes (
  user_id uuid references profiles(id) on delete cascade not null,
  question_id int references questions(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (user_id, question_id)
);

-- Denormalized count on questions, kept in sync via trigger
alter table questions add column if not exists likes_count int default 0 not null;

create or replace function bump_question_likes() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update questions set likes_count = likes_count + 1 where id = new.question_id;
  elsif TG_OP = 'DELETE' then
    update questions set likes_count = likes_count - 1 where id = old.question_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_question_likes_bump
  after insert or delete on question_likes
  for each row execute function bump_question_likes();

-- RLS: anyone authenticated can read; user manages own
alter table question_likes enable row level security;

create policy "question_likes_read_all" on question_likes for select
  using (auth.role() = 'authenticated');
create policy "question_likes_insert_own" on question_likes for insert
  with check (auth.uid() = user_id);
create policy "question_likes_delete_own" on question_likes for delete
  using (auth.uid() = user_id);

-- Also a votes_count materialization for sort by 'most voted'
alter table questions add column if not exists votes_count int default 0 not null;

create or replace function bump_question_votes() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update questions set votes_count = votes_count + 1 where id = new.question_id;
  elsif TG_OP = 'DELETE' then
    update questions set votes_count = votes_count - 1 where id = old.question_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_question_votes_bump
  after insert or delete on votes
  for each row execute function bump_question_votes();

-- Backfill existing data so counts are accurate
update questions q set
  votes_count = (select count(*) from votes v where v.question_id = q.id),
  likes_count = (select count(*) from question_likes l where l.question_id = q.id);

-- Comments count derives from arguments table
alter table questions add column if not exists arguments_count int default 0 not null;

create or replace function bump_question_arguments() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update questions set arguments_count = arguments_count + 1 where id = new.question_id;
  elsif TG_OP = 'DELETE' then
    update questions set arguments_count = arguments_count - 1 where id = old.question_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_question_arguments_bump
  after insert or delete on arguments
  for each row execute function bump_question_arguments();

update questions q set
  arguments_count = (select count(*) from arguments a where a.question_id = q.id);

-- Index for sort
create index if not exists idx_questions_published_likes
  on questions(status, likes_count desc) where status = 'published';
create index if not exists idx_questions_published_votes
  on questions(status, votes_count desc) where status = 'published';

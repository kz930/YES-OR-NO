-- Bug fix: trigger functions that maintain denormalized counts ran as
-- SECURITY INVOKER (default), so they ran with the calling user's RLS
-- profile. The `questions` table has no UPDATE policy, so attempts to
-- bump *_count columns were silently ignored (0 rows updated, no error).
--
-- Fix: recreate as SECURITY DEFINER so they run with the function owner's
-- (postgres) privileges, bypassing RLS for the count maintenance updates.
-- This is the standard Postgres pattern for trigger-driven aggregate
-- counters.

create or replace function bump_argument_likes() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update arguments set likes_count = likes_count + 1 where id = new.argument_id;
  elsif TG_OP = 'DELETE' then
    update arguments set likes_count = likes_count - 1 where id = old.argument_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

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

-- Re-backfill all counts now that the triggers actually work.
-- Includes any rows that were inserted between when triggers existed
-- but failed silently and now.
update questions q set
  votes_count    = (select count(*) from votes v          where v.question_id = q.id),
  likes_count    = (select count(*) from question_likes l where l.question_id = q.id),
  arguments_count = (select count(*) from arguments a     where a.question_id = q.id);

update arguments a set
  likes_count = (select count(*) from argument_likes l where l.argument_id = a.id);

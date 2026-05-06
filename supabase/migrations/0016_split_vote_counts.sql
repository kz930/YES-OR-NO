-- Bug fix: the vote split bar on /q/[id]/debate was reading a per-side
-- count via SELECT count(*) FROM votes — but RLS restricts votes reads
-- to self, so the count was always 0 or 1 (the viewer's own vote only).
--
-- Fix: maintain side-specific denormalized counts on questions and read
-- those (the questions table has a public SELECT policy).

alter table questions add column if not exists yes_votes_count int default 0 not null;
alter table questions add column if not exists no_votes_count int default 0 not null;

-- Update the existing INSERT/DELETE trigger to maintain side counters too
create or replace function bump_question_votes() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update questions set
      votes_count     = votes_count + 1,
      yes_votes_count = yes_votes_count + (case when new.current_side = 'a' then 1 else 0 end),
      no_votes_count  = no_votes_count  + (case when new.current_side = 'b' then 1 else 0 end)
    where id = new.question_id;
  elsif TG_OP = 'DELETE' then
    update questions set
      votes_count     = votes_count - 1,
      yes_votes_count = yes_votes_count - (case when old.current_side = 'a' then 1 else 0 end),
      no_votes_count  = no_votes_count  - (case when old.current_side = 'b' then 1 else 0 end)
    where id = old.question_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

-- Switching stance UPDATEs the row (current_side changes). Maintain counts.
create or replace function handle_vote_side_change() returns trigger as $$
begin
  if old.current_side is distinct from new.current_side then
    update questions set
      yes_votes_count = yes_votes_count + (case
        when new.current_side = 'a' and old.current_side <> 'a' then 1
        when old.current_side = 'a' and new.current_side <> 'a' then -1
        else 0
      end),
      no_votes_count = no_votes_count + (case
        when new.current_side = 'b' and old.current_side <> 'b' then 1
        when old.current_side = 'b' and new.current_side <> 'b' then -1
        else 0
      end)
    where id = new.question_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_vote_side_change on votes;
create trigger trg_vote_side_change
  after update on votes
  for each row execute function handle_vote_side_change();

-- Backfill the new columns
update questions q set
  yes_votes_count = (select count(*) from votes v where v.question_id = q.id and v.current_side = 'a'),
  no_votes_count  = (select count(*) from votes v where v.question_id = q.id and v.current_side = 'b');

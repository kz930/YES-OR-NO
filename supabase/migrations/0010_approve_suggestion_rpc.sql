-- Atomic approval: insert into questions + update the suggestion row in one
-- transaction. Called from /api/admin/suggestions/[id]/approve via RPC.
-- SECURITY DEFINER lets it bypass RLS — the API checks profiles.is_admin
-- before invoking, so authorization happens at the API boundary.

create or replace function approve_suggestion(suggestion_id uuid, reviewer uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  new_question_id int;
begin
  select * into s
  from question_suggestions
  where id = suggestion_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Suggestion not found or already reviewed';
  end if;

  insert into questions (
    title, description, category_id, source,
    side_a_label, side_b_label, status, is_daily
  )
  values (
    s.title, s.description, s.category_id, s.source,
    s.side_a_label, s.side_b_label, 'published', false
  )
  returning id into new_question_id;

  update question_suggestions
  set status = 'approved',
      reviewer_id = reviewer,
      approved_question_id = new_question_id,
      reviewed_at = now()
  where id = suggestion_id;

  return new_question_id;
end;
$$;

-- Allow authenticated users to call it (the API gates on is_admin first)
grant execute on function approve_suggestion(uuid, uuid) to authenticated;

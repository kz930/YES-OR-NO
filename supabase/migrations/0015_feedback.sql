-- User feedback / suggestions box. Distinct from question_suggestions —
-- this is for product feedback ("this button is confusing", "I want X
-- feature"), not for proposing new debate prompts.

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 5 and 1000),
  status text default 'open' not null
    check (status in ('open', 'resolved')),
  admin_reply text,
  resolver_id uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz default now() not null
);

create index idx_feedback_status_created on feedback(status, created_at desc);
create index idx_feedback_user on feedback(user_id, created_at desc);

alter table feedback enable row level security;

-- Users see their own feedback (incl. admin replies). Admins see all.
create policy "feedback_read_own_or_admin" on feedback for select
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Anyone authenticated can submit, but only as themselves
create policy "feedback_insert_own" on feedback for insert
  with check (auth.uid() = user_id);

-- Only admins can update (to add reply + resolve)
create policy "feedback_update_admin_only" on feedback for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

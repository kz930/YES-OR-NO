-- Defense-in-depth for email privacy.
-- Currently we rely on code discipline (no public-facing query selects email).
-- This migration adds a DB-enforced layer:
--
-- 1. profiles table SELECT is restricted to self
-- 2. public_profiles view exposes (id, nickname, avatar_url, is_admin, created_at)
--    — no email, no other PII
-- 3. authenticated/anon get SELECT on the view, not the table
--
-- A buggy or compromised frontend can no longer leak someone else's email.
-- Self-view (eg /me) still hits profiles directly because RLS lets you read
-- your own row.

-- 1. Tighten the read policy on profiles
drop policy if exists "profiles_read_all" on profiles;
create policy "profiles_read_self" on profiles for select using (auth.uid() = id);

-- 2. The view: PII-free projection.
-- security_invoker = true so the view checks RLS as the querying user.
-- Default is false (creator perms = postgres = bypasses RLS), which would
-- expose all rows even if profiles RLS gets stricter — we don't want that
-- here because we DO want public_profiles to be world-readable.
-- Reasoning: hide email but expose the rest, so we use a separate grant
-- set instead of RLS for the view's authorization.
create or replace view public_profiles
  with (security_invoker = false)
  as
  select id, nickname, avatar_url, is_admin, created_at
  from profiles;

-- 3. Grant SELECT on the view to all roles
grant select on public_profiles to authenticated, anon;

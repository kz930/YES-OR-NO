-- Auto-create profiles row when a new auth.users row is inserted.
-- Reads email/nickname from raw_user_meta_data passed at signUp().
--
-- Frontend calls supabase.auth.signUp({
--   email, password,
--   options: { data: { nickname: '...' } }
-- })
-- and this trigger materializes the profile in the same transaction.

create or replace function handle_new_user() returns trigger as $$
declare
  meta_nickname text;
begin
  meta_nickname := new.raw_user_meta_data->>'nickname';

  -- Fallback if no nickname provided: use part before @ from email
  if meta_nickname is null or char_length(meta_nickname) < 2 then
    meta_nickname := split_part(new.email, '@', 1);
  end if;

  -- Truncate to 12 chars max (matches profiles.nickname constraint)
  if char_length(meta_nickname) > 12 then
    meta_nickname := substring(meta_nickname from 1 for 12);
  end if;

  insert into public.profiles (id, email, nickname)
  values (new.id, new.email, meta_nickname);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

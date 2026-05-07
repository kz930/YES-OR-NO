-- Relax nickname length cap: 12 → 50 chars
-- (Original limit was set in 0001; the auto-create trigger in 0002 also
-- truncates to 12, update it too.)

-- 1) Replace the table constraint
alter table profiles drop constraint if exists profiles_nickname_check;
alter table profiles add constraint profiles_nickname_check
  check (char_length(nickname) between 2 and 50);

-- 2) Replace the trigger function so the truncation matches
create or replace function handle_new_user() returns trigger as $$
declare
  meta_nickname text;
begin
  meta_nickname := new.raw_user_meta_data->>'nickname';

  if meta_nickname is null or char_length(meta_nickname) < 2 then
    meta_nickname := split_part(new.email, '@', 1);
  end if;

  if char_length(meta_nickname) > 50 then
    meta_nickname := substring(meta_nickname from 1 for 50);
  end if;

  insert into public.profiles (id, email, nickname)
  values (new.id, new.email, meta_nickname);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

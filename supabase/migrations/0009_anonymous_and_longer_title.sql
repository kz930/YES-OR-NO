-- Bump suggestion title length 80 → 200 and add is_anonymous flags.
-- When is_anonymous = true on an argument or suggestion, the public UI
-- shows '匿名' and a neutral avatar instead of the author's nickname.
-- The author still sees their own item normally on their /me pages,
-- and admin still sees who submitted (for moderation/spam tracking).

-- 1. Suggestions: title can now be up to 200 chars
alter table question_suggestions
  drop constraint if exists question_suggestions_title_check;

alter table question_suggestions
  add constraint question_suggestions_title_check
    check (char_length(title) between 10 and 200);

-- 2. Anonymous flag on suggestions
alter table question_suggestions
  add column if not exists is_anonymous boolean default false not null;

-- 3. Anonymous flag on comments (arguments)
alter table arguments
  add column if not exists is_anonymous boolean default false not null;

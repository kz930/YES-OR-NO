-- Batch description updates for existing questions.
-- We accumulate edits here while reviewing prompts together — run this
-- once at the end of the review pass instead of one-shot updates.

-- Heinz dilemma: full setup so users have the rich detail Kohlberg
-- intended (only-child cure, 10× markup, refused all alternatives,
-- only half the money raised).
update questions
set description = '海因兹的孩子得了绝症,只有一种新药能救。药剂师自己发明的药,定价是成本的 10 倍。海因兹只凑到一半钱,药剂师拒绝降价、拒绝赊账。除了偷,孩子就没救了。'
where title like '海因兹困境%';

-- 1) Add background description to 忒修斯之船 (origin myth + setup).
update questions
set description = '忒修斯是希腊神话英雄,他驾着这艘船杀死了食人怪米诺陶洛斯,凯旋归来。雅典人把船当作纪念保存了几百年。木板烂了就换,绳子破了就修,直到所有零件都被替换过 —— 而船一直停在那里。'
where title like '忒修斯之船%';

-- 2) Add the Hobbes variant as a separate question.
-- Idempotent — won't double-insert if migration runs twice.
insert into questions (title, description, category_id, source, source_detail, side_a_label, side_b_label, status, is_daily)
select
  '把忒修斯之船换下来的旧木板拼成另一艘船 —— 这艘和零件全换过的那艘,哪艘才是"原来的"?',
  '承接「忒修斯之船」:有人把每次换下来的旧木板都收集起来,最后拼成了一艘船。现在两艘并存 —— 一艘是当年那艘,只是零件全换过;另一艘由原始旧木板拼成。哪艘才是"原来的"忒修斯之船?',
  2,
  'Thomas Hobbes',
  '1655 《论物体》',
  '现役那艘',
  '旧木板拼的',
  'published',
  false
where not exists (
  select 1 from questions where title like '把忒修斯之船换下来的旧木板%'
);

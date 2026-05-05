-- Sample questions for Sprint 1 testing.
-- Full 51-question seed comes in Sprint 5.
-- Picks 2 from each of the 4 categories.

insert into questions (title, category_id, source, source_detail, is_daily)
select * from (values
  -- 奇葩说脑洞 (category_id = 1)
  ('收到30年后的自己发来的人生建议,你要不要看?',
    1, '奇葩说', '第7季半决赛', true),
  ('美术馆着火,一幅名画和一只猫,只能救一个救谁?',
    1, '奇葩说', '第6季第4期', false),

  -- 经典思想实验 (category_id = 2)
  ('忒修斯之船:零件全换光的船还是原来那艘船吗?',
    2, 'Plutarch', '古希腊', false),
  ('经验机器:一台机器能模拟完美一生,你愿意一辈子接入吗?',
    2, 'Robert Nozick', '1974', false),

  -- 二选一 (category_id = 3)
  ('永生但身边的人都正常生死,还是正常寿命但所有亲友都永生?',
    3, 'Would You Rather', null, false),
  ('失去视力,还是失去记忆?',
    3, 'Would You Rather', null, false),

  -- 网络流传 (category_id = 4)
  ('给你一个亿,但你必须从地球上消失(所有人忘记你),要吗?',
    4, '知乎', '"如果...你会"系列', false),
  ('你能听到陌生人对你的真实看法(只要他们想到你)。开还是不开?',
    4, '知乎/豆瓣', null, false)
) as t(title, category_id, source, source_detail, is_daily);

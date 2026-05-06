-- Sample questions for Sprint 1 testing.
-- Full 51-question seed comes in Sprint 5.
-- Picks 2 from each of the 4 categories.
--
-- side_a_label / side_b_label are the *answers*; the big "YES"/"NO" wordmark
-- on buttons is the brand, the small label below tells the user what that
-- side actually means for this question.

insert into questions (title, category_id, source, source_detail, is_daily, side_a_label, side_b_label)
select * from (values
  -- 奇葩说脑洞 (category_id = 1)
  ('收到30年后的自己发来的人生建议,你要不要看?',
    1, '奇葩说', '第7季半决赛', true,  '看',     '不看'),
  ('美术馆着火,一幅名画和一只猫,只能救一个救谁?',
    1, '奇葩说', '第6季第4期', false, '名画',   '猫'),

  -- 经典思想实验 (category_id = 2)
  ('忒修斯之船:零件全换光的船还是原来那艘船吗?',
    2, 'Plutarch', '古希腊', false, '是',     '不是'),
  ('经验机器:有一台机器能给你一段完美的模拟人生,代价是从此活在虚拟里。你愿意进去吗?',
    2, 'Robert Nozick', '1974', false, '愿意', '不愿意'),

  -- 二选一 (category_id = 3)
  ('永生但身边的人都正常生死,还是正常寿命但所有亲友都永生?',
    3, 'Would You Rather', null, false, '我永生', '亲友永生'),
  ('失去视力,还是失去记忆?',
    3, 'Would You Rather', null, false, '失去视力', '失去记忆'),

  -- 网络流传 (category_id = 4)
  ('给你一个亿,但所有人都会忘记你,你愿意吗?',
    4, '知乎', '"如果...你会"系列', false, '要', '不要'),
  ('假如有种能力:陌生人每次在心里想到你,你都能听见他们的真实看法。你要不要?',
    4, '知乎/豆瓣', null, false, '要', '不要')
) as t(title, category_id, source, source_detail, is_daily, side_a_label, side_b_label);

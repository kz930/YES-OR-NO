-- Update side labels for the sample questions so they match the actual choice.
-- The seed in 0003 left them all as default 支持/反对; for questions that aren't
-- yes/no shaped this looks wrong (e.g. 名画 vs 猫).
--
-- The big YES / NO wordmark on buttons is the brand, the small label below is
-- what each side actually stands for.

update questions set side_a_label = '看',     side_b_label = '不看'   where title like '收到30年后的自己%';
update questions set side_a_label = '名画',   side_b_label = '猫'     where title like '美术馆着火%';
update questions set side_a_label = '是',     side_b_label = '不是'   where title like '忒修斯之船%';
update questions set side_a_label = '接入',   side_b_label = '不接入' where title like '经验机器%';
update questions set side_a_label = '我永生', side_b_label = '亲友永生' where title like '永生但身边的人%';
update questions set side_a_label = '失去视力', side_b_label = '失去记忆' where title like '失去视力%';
update questions set side_a_label = '愿意', side_b_label = '不愿意' where title like '给你一个亿%';
update questions set side_a_label = '开',     side_b_label = '不开'   where title like '你能听到陌生人%';

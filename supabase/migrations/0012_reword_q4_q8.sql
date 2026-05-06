-- Reword Q4 (经验机器) and Q8 (陌生人评价) per user feedback —
-- make the trade-off explicit and replace mechanical verbs ('接入', '开')
-- with conversational phrasing.

-- Q4 — 经验机器
update questions
set title        = '经验机器:有一台机器能给你一段完美的模拟人生,代价是从此活在虚拟里。你愿意进去吗?',
    side_a_label = '愿意',
    side_b_label = '不愿意'
where title like '经验机器%';

-- Q8 — 听陌生人的真实看法
update questions
set title        = '假如有种能力:陌生人每次在心里想到你,你都能听见他们的真实看法。你要不要?',
    side_a_label = '要',
    side_b_label = '不要'
where title like '你能听到陌生人%'
   or title like '%陌生人%在心里想到你%';

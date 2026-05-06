-- Reword Q7 per user feedback. Update labels too so they match the new
-- '愿意吗' phrasing.
update questions
set title         = '给你一个亿,但所有人都会忘记你,你愿意吗?',
    side_a_label  = '愿意',
    side_b_label  = '不愿意'
where title = '给你一个亿,但你必须从地球上消失(所有人忘记你),要吗?'
   or title = '给你一个亿,但所有人都会忘记你,你愿意吗?';

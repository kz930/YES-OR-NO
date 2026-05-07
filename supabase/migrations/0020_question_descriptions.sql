-- Batch 2 of description edits — 0018 already ran, so subsequent
-- prompt edits accumulate here.

-- Cow in the field (Gettier): rewrite title to emphasize 'reason was
-- wrong' since that's the philosophical crux, and use the description
-- for the photo-vs-real-cow setup + the 2000-year context.
update questions
set title = '空地上的奶牛:你"知道"空地上有奶牛,但你相信它的理由是错的。这算"知识"吗?',
    description = E'你看到一张照片,里面是一头奶牛在空地上。你说"我知道空地上有奶牛"。\n\n结果照片是假的(被风吹来的),不是真奶牛。但巧合的是,照片后面的树后真的藏着一头奶牛。\n\n所以你的结论是对的,但你相信它的理由是错的 —— 你被一张照片骗了,只是碰巧结论对。\n\nGettier 1963 年用这种例子挑战 2000 年来"知识 = 被证成的真信念"的定义:如果靠错误的理由蒙对了,这算"知道"吗?'
where title like '空地上的奶牛%';

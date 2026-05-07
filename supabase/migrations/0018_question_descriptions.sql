-- Batch description updates for existing questions.
-- We accumulate edits here while reviewing prompts together — run this
-- once at the end of the review pass instead of one-shot updates.

-- Heinz dilemma: full setup so users have the rich detail Kohlberg
-- intended (only-child cure, 10× markup, refused all alternatives,
-- only half the money raised).
update questions
set description = '海因兹的孩子得了绝症,只有一种新药能救。药剂师自己发明的药,定价是成本的 10 倍。海因兹只凑到一半钱,药剂师拒绝降价、拒绝赊账。除了偷,孩子就没救了。'
where title like '海因兹困境%';

-- Ticking time bomb: paint the role + urgency + exhausted alternatives
update questions
set description = '你是反恐部门负责人。一颗炸弹将在几小时内引爆,可能炸死成百上千人。你抓到了一个嫌犯,他知道炸弹的位置,但拒绝开口。常规审讯走完了,没时间了。'
where title like '定时炸弹%';

-- Teleportation puzzle (Parfit): surface that the original is destroyed
update questions
set description = 'Derek Parfit 的传送实验:扫描器把你完整记录下来(每一个原子的位置 + 每一段记忆),传输到火星,然后用新原子在火星重组出"你"。重组的人长得和你一样、记忆和你一样。但传输过程会把地球上的"你"拆解掉。'
where title like '传送机难题%';

-- Socrates vs the pig (Mill): name the higher-vs-lower pleasures distinction
update questions
set description = '出自 John Stuart Mill。他认为"高级快乐"(思想、艺术、智识)比"低级快乐"(吃喝、肉体满足)更值得追求,即使前者带来的不满足比后者多得多。原句:"做一个不满足的苏格拉底,胜过做一只满足的猪。"'
where title like '苏格拉底与猪%';

-- Mary's room (Jackson): full setup of complete physical knowledge yet B&W
update questions
set description = '玛丽是色彩学家,她知道关于颜色的全部物理知识 —— 波长、眼睛怎么接收光线、大脑哪些神经元在响应。但她从小被关在一个只有黑白两色的房间里,从没亲眼见过红色。有一天她走出房间,第一次看到一个红苹果 —— 这一瞬间,她有学到原本不知道的东西吗?Frank Jackson 用这个挑战"一切都能被科学解释"。'
where title like '玛丽的房间%';

-- Brain in a vat (Putnam): Matrix lineage, why the question is unfalsifiable
update questions
set description = 'Hilary Putnam 1981 年提出,《黑客帝国》的灵感来源。假设邪恶科学家把一个大脑泡在营养液里,通过电极给它输入完全逼真的视觉、听觉、记忆 —— 这个大脑会"觉得"自己在过正常生活。你怎么证明自己不是?'
where title like '缸中之脑%';

-- Veil of ignorance (Rawls): pre-birth thought experiment for fairness design
update questions
set description = 'John Rawls《正义论》(1971) 的核心思路。设想在你出生之前,有一道幕挡住了一切信息 —— 你不知道自己会是男女种族、富贵贫穷、聪明笨拙、健康残疾。此刻你被要求投票决定社会的游戏规则(税率、教育、医疗、福利、惩罚……)。因为你可能投到最弱势那一面,你会本能地设计一套对所有人都不太坏的规则。Rawls 认为这就是真正公平的规则。'
where title like '无知之幕%';

-- Chinese Room (Searle): rulebook setup, challenges whether AI really understands
update questions
set description = 'John Searle 1980 年提出,挑战 AI 是否真的能"理解"。一个完全不懂中文的人被锁在房间里,手里有一本巨厚的英文规则手册:看到这些符号就输出那些符号。中国人从门缝递进中文问题,他查手册、按规则机械输出 —— 输出的恰好是完美的中文回答。屋外看:这个房间会说中文。屋里的人:完全不懂自己在说啥。这个房间"懂"中文吗?'
where title like '中文房间%';

-- User-submitted prompt: trim the inline parenthetical out of the title and
-- move the two examples into the description. Title stays as the clean
-- yes/no question; the examples now live behind the '了解背景' toggle.
update questions
set title = '被身边人过度扭曲爱着,还是被身边人隐形冷暴力?',
    description = '比如:你最好的朋友和你最好的朋友吵架了,ta 们都想让与这件事毫无关联的你帮 ta 们说出该怎么办并解决。再比如:你的同学/同事/共同认识的网友们在私下建了群,大部分人都在,不是那种背后骂人的小群,也没人对你有很大意见,但就是唯独没拉你。'
where title like '被身边人过度扭曲爱着%';

-- User-submitted: red/blue capsule coordination game. Original title was a
-- mash of math notation; rewrite as a narrative title with clean rule list
-- in description (rendered with whitespace-pre-line so the bullets break).
update questions
set title = '想象所有人同时秘密选择红色或蓝色胶囊,然后揭晓。如果全员都选红色,所有人死;如果红色派占多数但不是全部,红色活下来、蓝色派死;但只要蓝色派达到一半,全员都活下来。',
    description = E'① 100% 都选红色 → 全员死亡\n② 红色超过一半(但不是全部) → 红色活、蓝色死\n③ 蓝色达到一半或更多 → 全员都活'
where title like '红蓝胶囊问题%';

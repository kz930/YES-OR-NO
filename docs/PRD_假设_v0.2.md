# 「假设」 - 产品需求文档(PRD)

> 一个让你为脑洞辩论投票、看观点、参与讨论的轻社区。  
> 只做思想实验和有趣的假设题,拒绝政治和现实争议。

**版本**:v0.2  
**目标读者**:Claude Code(实现)+ 产品本人(决策)  
**阶段**:MVP

**v0.2 变更**:把"用户提议题目 + 管理员审核"从「MVP 后再说」提到 MVP 范围内(详见 §3.1、§5.2.8、§7、§8)。

---

## 0. 给 Claude Code 的执行须知

读完这份 PRD,在动工前请按以下顺序工作:

1. **先搭骨架**:Next.js + Supabase + Tailwind 基础工程跑起来,能登录,能看到一个首页
2. **再做核心闭环**:登录 → 看题 → 投票 → 看双方论点 → 发论点 → 点赞,这一条路打通
3. **最后做装饰**:首页的每日一题精修、个人中心、收藏、分享等
4. **视觉风格在最后统一打磨**——先用 shadcn/ui 默认样式跑通逻辑,再换成 Duolingo 风

**优先级**:核心闭环 > 数据完整性 > 视觉炫酷 > 边缘功能。如果时间不够,砍掉边缘功能,但核心闭环必须丝滑。

**遇到歧义**:不要等用户回复,自己拍板,在代码 commit message 里写"决策:XXX,理由:XXX",我事后审。

---

## 1. 产品概述

### 1.1 一句话
**5分钟,一道脑洞题,先选边再开战。**

### 1.2 核心机制
1. 用户看到一个脑洞辩题(例如"如果有按钮能看到伴侣多爱你,你按吗?")
2. **必须先投票**(支持/反对),不投票看不到任何观点
3. 投票后进入辩论页:屏幕分两列,正方观点 vs 反方观点
4. 用户可以发表自己的论点(自动归到 ta 投票的那一列)
5. 可以给其他论点点赞,也可以"切换立场"(被对方说服了)

### 1.3 差异化定位
| 维度 | 本产品 | 微博/小红书 | 知乎 | Kialo |
|------|------|------|------|------|
| 内容 | 纯脑洞,无政治 | 全部都有 | 全部都有 | 政治为主 |
| 形式 | 投票+对辩 | 评论流 | 答主长文 | 论辩树 |
| 氛围 | 轻松游戏感 | 情绪化 | 专业感 | 严肃 |
| 平台 | Mobile Web (PWA) | App | App+Web | Web |

---

## 2. 目标用户

**核心**:18-30岁,看过奇葩说,在知乎/即刻活跃,喜欢"动脑子但不想被骂"  
**扩散**:把题目当聚会破冰、朋友群里@朋友吵的人

**不是目标用户**:想看现实争议、想找情绪共鸣、想要严肃哲学学习的人

---

## 3. MVP 功能范围

### 3.1 必做(MVP 范围内)

| 模块 | 功能 |
|------|------|
| **认证** | 邮箱+密码注册;邮箱+密码登录;退出登录 |
| **首页** | 每日一题(精选);题库列表入口;个人中心入口 |
| **题库** | 按分类浏览(4大类);随机抽题按钮 |
| **题目详情** | 题面、来源、投票按钮(强制先投);投票后进入辩论页 |
| **辩论页** | 双列展示正反方论点;发表自己的论点;点赞;切换立场 |
| **个人中心** | 我的昵称/头像;我的投票记录;我发的论点;我提议的题目 |
| **题目提议** | 用户提交新题(进审核队列);查看自己提议的状态;管理员审核 |

### 3.2 不做(MVP 后再说)

- 评论嵌套(只支持单层论点,不支持论点的回复)
- 关注/粉丝系统
- 推送通知
- 私信
- 多语言
- 暗黑模式
- 第三方登录(Google/微信)

---

## 4. 完整用户流程

```
新用户:
  下载/打开链接 → 注册页(邮箱+密码+昵称) → 验证邮箱 → 登录 → 首页

老用户:
  打开链接 → 登录页 → 首页

核心闭环:
  首页 → 看到一道题 → 点进去 → 看题面 → [必须投票] → 进入辩论页
        ↓
  辩论页:
    - 看到正方/反方两列论点(按点赞数排序)
    - 自己投了哪边,那一列上方有"我也投了这边"的标识
    - 可以点赞任何论点(包括对方的)
    - 可以发表自己的论点 → 提交后出现在自己投票那一列
    - 可以"切换立场"按钮 → 切换后,过往论点保留,新论点归到新一边
        ↓
  返回首页 → 看下一题 → 循环
```

---

## 5. 页面规格(Page Specs)

### 5.1 路由表

| 路径 | 页面 | 是否需登录 |
|------|------|------|
| `/login` | 登录页 | 否 |
| `/register` | 注册页 | 否 |
| `/` | 首页 | 是 |
| `/explore` | 题库浏览 | 是 |
| `/q/[id]` | 题目详情(投票前) | 是 |
| `/q/[id]/debate` | 辩论页(投票后) | 是 |
| `/me` | 个人中心 | 是 |
| `/me/votes` | 我的投票历史 | 是 |
| `/me/arguments` | 我发表的论点 | 是 |
| `/me/suggestions` | 我提议的题目(含状态) | 是 |
| `/suggest` | 提议新题表单 | 是 |
| `/admin/suggestions` | 管理员审核队列 | 是(且 is_admin) |

未登录用户访问需登录页面 → 跳转 `/login`,登录后跳回原路径。

### 5.2 关键页面详细规格

#### 5.2.1 登录页 `/login`
- 输入框:邮箱、密码
- 主按钮:"登录"(Duolingo 绿,大圆角,有按下阴影动画)
- 副链接:"还没账号?去注册"
- 错误状态:邮箱格式错误、密码错误均给出明确提示

#### 5.2.2 注册页 `/register`
- 输入框:邮箱、密码、昵称
- 密码要求:至少6位
- 昵称:2-12 字符,不重复
- 注册成功后:发邮件验证;同时直接登录到首页(不强制必须验证邮箱才能用,降低流失)

#### 5.2.3 首页 `/`
**结构**(从上到下):
1. **顶栏**:Logo 「假设」+ 右上角头像入口
2. **每日一题卡片**(主视觉):
   - 大卡片,占屏幕一屏的 60%
   - 题面文字大、有呼吸感
   - 底部两个并排的大按钮:"支持"(绿)/ "反对"(粉/红)
   - 点击任一按钮 → 跳到 `/q/[id]/debate`
3. **"换一道"按钮**:随机换一道题
4. **分类入口**(横向滑动卡片):
   - 4 个分类:奇葩说脑洞 / 经典思想实验 / 二选一 / 网络流传
   - 每个分类一张配色不同的卡片,点进去 → `/explore?category=xxx`

#### 5.2.4 题库浏览 `/explore`
- 顶部 Tab:全部 / 奇葩说脑洞 / 经典思想实验 / 二选一 / 网络流传
- 下方:卡片列表,每张卡显示:
  - 题面(2行内截断)
  - 当前总投票数 / 投票比例小条
  - 来源标签(如"奇葩说 第6季")
- 点击 → `/q/[id]`(如果还没投过)或 `/q/[id]/debate`(如果已投过)

#### 5.2.5 题目详情(投票前)`/q/[id]`
- 题面(大字)
- 来源说明(小字)
- 两个大按钮(屏幕底部 fixed):"支持" / "反对"
- 点击后:有一个 0.5s 的过渡动画(按钮放大→收缩→跳转),然后进入辩论页
- 已投票用户访问此路径自动重定向到 `/q/[id]/debate`

#### 5.2.6 辩论页 `/q/[id]/debate` ⭐ 核心
**结构**:
1. **顶部**:题面(可折叠,默认展开)
2. **投票统计条**:可视化显示当前正方/反方投票比例(如绿色 67% : 粉色 33%)
3. **我的立场标识**:"你投了支持方"+ "切换立场"按钮(灰色小按钮,避免太突出)
4. **双列论点墙**(核心):
   - 屏幕左右分两列,各占一半
   - 左列(支持方):绿色系背景的论点卡片
   - 右列(反对方):粉色系背景的论点卡片
   - 每张论点卡片:
     - 用户昵称+头像
     - 论点内容(最多 200 字)
     - 点赞数 + 点赞按钮
     - 时间戳(相对时间,如"2小时前")
   - 默认按点赞数倒序;切换为按时间排序的开关
5. **底部输入框**(fixed):"说说你的看法..." 点击后展开成多行输入,提交后归到自己立场那一列

**移动端适配**:
- 双列在手机上仍然是左右两列(因为左右对比是产品的核心视觉),但每列宽度会很窄
- 可选交互:用 Tab 切换"支持论点 / 反对论点 / 全部"——更易读但失去对比感
- **决策**:MVP 阶段先做"双列硬塞",视觉冲击最强;窄屏(< 360px)用 Tab 兜底

**切换立场逻辑**:
- 点击"切换立场" → 弹窗确认("你确定被对方说服了?")
- 确认后:用户的 vote 记录保留(用于 stance_change 数据),但当前立场更新
- 之前发的论点保留在原立场(不会被移动)
- 新发的论点归到新立场

#### 5.2.7 个人中心 `/me`
- 头像、昵称(可编辑)
- 数据卡片:总投票数、发表论点数、获得点赞数、立场切换次数(炫耀指标)
- 入口:我的投票 `/me/votes`、我的论点 `/me/arguments`、我提议的题目 `/me/suggestions`、提议新题 `/suggest`、退出登录
- 如果 `is_admin = true`,额外显示管理员入口 → `/admin/suggestions`

#### 5.2.8 提议新题 `/suggest`
- 表单字段:
  - 题面(必填,10–80 字)
  - 描述/补充(选填,最多 200 字)
  - 分类(必选下拉:奇葩说脑洞 / 经典思想实验 / 二选一 / 网络流传)
  - 立场 A 标签(默认"支持")
  - 立场 B 标签(默认"反对")
  - 来源说明(选填,如"知乎 @xxx")
- 提交按钮(Duolingo 绿)
- 文案提示:
  - 顶部:"提议一道题,通过审核后会加入题库,所有人都能投票讨论"
  - 底部小字:"政治/现实争议类内容会被驳回。每天最多提交 3 题。"
- 提交成功后 → 跳到 `/me/suggestions`,顶部 toast 显示 "已提交,等待审核"
- 限流:同一用户 24h 内 ≥ 3 条 `pending` 状态时,提交按钮禁用并显示原因

#### 5.2.9 我提议的题目 `/me/suggestions`
- 列表:每条显示题面、分类、提交时间、状态徽章
  - 🟡 待审核(pending)
  - ✅ 已通过(approved) → 点击跳到对应题目辩论页
  - ❌ 未通过(rejected) → 展开显示驳回理由
- 驳回的题不可编辑重提,如需可点 "再提一道" 跳到 `/suggest`(空表单)

#### 5.2.10 管理员审核队列 `/admin/suggestions`
- **访问控制**:三层(前端守卫 + API 鉴权 + Supabase RLS),非 admin 看到 404
- 顶部 Tab:待审核(默认) / 已通过 / 已驳回
- 列表:每条显示题面、提议人昵称、分类、提交时间
- 单条操作:
  - "通过" 按钮 → 弹窗确认 → 写入 `questions` 表(状态 `published`),原 `question_suggestions.status = 'approved'`,记录 `approved_question_id`
  - "驳回" 按钮 → 弹窗要求填写理由(必填,5–100 字)→ `status = 'rejected'`,`reviewer_note` 存理由
- 驳回理由模板下拉(快速选择):"含政治/现实争议"、"题面不清晰"、"重复题目"、"立场不对等"、"自定义"

---

## 6. 视觉设计规范

### 6.1 色彩系统(Duolingo 启发的多巴胺配色)

```css
/* 主色 */
--brand-green: #58CC02;       /* Duolingo 绿,主 CTA */
--brand-green-dark: #58A700;  /* 按钮按下阴影 */

/* 立场色 */
--side-a-bg: #58CC02;         /* 支持方:绿 */
--side-a-bg-light: #D7FFB8;   /* 支持方背景浅色 */
--side-b-bg: #FF4B4B;         /* 反对方:粉红 */
--side-b-bg-light: #FFD9D9;   /* 反对方背景浅色 */

/* 多色点缀 */
--accent-blue: #1CB0F6;       /* 链接、信息 */
--accent-yellow: #FFC800;     /* 点赞、奖励 */
--accent-purple: #CE82FF;     /* 特殊标识 */
--accent-orange: #FF9600;     /* 警告 */

/* 中性色 */
--text-primary: #3C3C3C;
--text-secondary: #777777;
--bg-default: #FFFFFF;
--bg-card: #F7F7F7;
--border: #E5E5E5;
```

### 6.2 字体

- 中文:`-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`
- 英文/数字:`"Nunito", "SF Pro Rounded", sans-serif`(圆润字体,Duolingo 风)
- 题面正文:大字号 24-28px,字重 700
- 论点正文:16px,字重 400
- 标签/小字:13px

### 6.3 圆角与阴影

- 大卡片:`rounded-3xl`(24px)
- 按钮:`rounded-2xl`(16px)
- 论点卡片:`rounded-2xl`
- **Duolingo 式立体按钮**:按钮底部有 4px 深色阴影,按下后阴影消失、按钮下移 4px
  ```css
  /* 静态 */
  box-shadow: 0 4px 0 var(--brand-green-dark);
  /* 按下 */
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--brand-green-dark);
  ```

### 6.4 动画

- 投票按钮按下:有"被按扁"的视觉反馈(0.1s)
- 投票成功跳转:卡片缩放 + 淡出过渡(0.4s)
- 点赞:粒子心形从按钮飞起(0.6s,可选)
- 列表加载:骨架屏,不要 spinner

### 6.5 整体调性

> **想象一个会"奖励你思考"的产品**——颜色明亮、按钮 satisfying、每次互动都有点小惊喜。但克制,不要花哨到分散对内容的注意力。

参考产品:Duolingo、Habitica、Pinterest 早期、Things 3。

---

## 7. 数据模型(Supabase / PostgreSQL)

### 7.1 表结构

```sql
-- 用户(Supabase Auth 自带,这里是扩展)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nickname text unique not null check (char_length(nickname) between 2 and 12),
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 题目分类
create table categories (
  id serial primary key,
  slug text unique not null,        -- "qipashuo" / "philosophy" / "either-or" / "internet"
  name text not null,                -- "奇葩说脑洞"
  color_hex text,                    -- 卡片配色
  display_order int default 0
);

-- 题目
create table questions (
  id serial primary key,
  title text not null,                          -- 题面
  description text,                              -- 详细描述(可选)
  category_id int references categories(id),
  source text,                                   -- "奇葩说" / "Robert Nozick" / "知乎"
  source_detail text,                            -- "第6季第20期" / "1969"
  side_a_label text default '支持',
  side_b_label text default '反对',
  status text default 'published' check (status in ('draft', 'published', 'archived')),
  is_daily boolean default false,                -- 是否参与"每日一题"轮播
  created_at timestamptz default now()
);

-- 投票(同一用户对同一题只能有一条记录,但 side 可以更新)
create table votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  question_id int references questions(id) on delete cascade,
  initial_side char(1) check (initial_side in ('a', 'b')),  -- 第一次投的边
  current_side char(1) check (current_side in ('a', 'b')),  -- 当前的边(切换立场会改)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, question_id)
);

-- 立场切换记录
create table stance_changes (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references votes(id) on delete cascade,
  from_side char(1) not null,
  to_side char(1) not null,
  created_at timestamptz default now()
);

-- 论点
create table arguments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  question_id int references questions(id) on delete cascade,
  side char(1) check (side in ('a', 'b')),       -- 发表时归属的立场
  content text not null check (char_length(content) <= 200),
  likes_count int default 0,                      -- 冗余字段,加速查询
  created_at timestamptz default now()
);

-- 论点点赞
create table argument_likes (
  user_id uuid references profiles(id) on delete cascade,
  argument_id uuid references arguments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, argument_id)
);

-- 题目提议(用户提交,等待管理员审核)
create table question_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 10 and 80),
  description text check (char_length(description) <= 200),
  category_id int references categories(id),
  side_a_label text default '支持',
  side_b_label text default '反对',
  source text,                                   -- 用户填的来源说明(选填)
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,                            -- 驳回理由(rejected 时必填)
  reviewer_id uuid references profiles(id),     -- 谁审的
  approved_question_id int references questions(id),  -- 通过后生成的题目 id
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- 索引
create index idx_arguments_question_side_likes 
  on arguments(question_id, side, likes_count desc);
create index idx_votes_user on votes(user_id);
create index idx_suggestions_status_created 
  on question_suggestions(status, created_at desc);
create index idx_suggestions_user on question_suggestions(user_id, created_at desc);
```

### 7.2 关键业务规则

- 用户必须先投票(`votes` 表有记录)才能在该题发表论点
- 切换立场会更新 `votes.current_side`,并写入 `stance_changes`
- 已发表的论点不会随立场切换而移动归属
- 点赞数通过触发器维护 `arguments.likes_count`,避免每次 count(*)
- **题目提议限流**:同一 `user_id` 在 24h 内只能有 ≤ 3 条 `pending` 状态的 suggestion(API 层校验,DB 层不强制)
- **审核通过流程**:`status='approved'` 时,在事务内插入一条新 `questions` 记录(`status='published'`),并把生成的 id 写回 `approved_question_id`
- **驳回流程**:`status='rejected'` 时,`reviewer_note` 必填(API 层强制)
- **RLS 关键策略**:
  - `question_suggestions` 普通用户只能 SELECT 自己的(`auth.uid() = user_id`),admin 可 SELECT 全部
  - `question_suggestions` UPDATE 仅限 admin
  - `profiles.is_admin` 字段普通用户不可写

---

## 8. API 设计

使用 Next.js App Router 的 Route Handlers,前缀 `/api`。

### 8.1 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册(走 Supabase Auth) |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |

### 8.2 题目

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 列表(支持 `?category=xxx&page=N`) |
| GET | `/api/questions/daily` | 今日精选 |
| GET | `/api/questions/random` | 随机一道 |
| GET | `/api/questions/[id]` | 详情(含我的投票状态) |
| POST | `/api/questions/[id]/vote` | 投票 `body: { side: 'a' | 'b' }` |
| POST | `/api/questions/[id]/switch` | 切换立场 |

### 8.3 论点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions/[id]/arguments` | 该题论点(支持 `?side=a&sort=likes\|time`) |
| POST | `/api/questions/[id]/arguments` | 发表论点 `body: { content }` |
| POST | `/api/arguments/[id]/like` | 点赞 |
| DELETE | `/api/arguments/[id]/like` | 取消点赞 |

### 8.4 个人

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/me` | 我的资料 + 统计数据(含 `is_admin`) |
| PATCH | `/api/me` | 更新昵称/头像 |
| GET | `/api/me/votes` | 我的投票历史 |
| GET | `/api/me/arguments` | 我发表的论点 |
| GET | `/api/me/suggestions` | 我提议的题目(含状态、驳回理由) |

### 8.5 题目提议

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/suggestions` | 提交新题(校验 24h 内 pending ≤ 3) |
| GET | `/api/admin/suggestions` | 管理员审核队列(支持 `?status=pending\|approved\|rejected`) |
| POST | `/api/admin/suggestions/[id]/approve` | 通过(事务:写 questions + 更新 suggestion) |
| POST | `/api/admin/suggestions/[id]/reject` | 驳回 `body: { reviewer_note }` |

所有 `/api/admin/*` 端点服务端必须先校验 `profiles.is_admin = true`,否则返回 403。

---

## 9. 技术栈

| 层 | 选择 | 理由 |
|----|------|------|
| 前端框架 | **Next.js 14 (App Router)** | SSR + 路由 + API 一体,Vercel 部署最快 |
| 语言 | **TypeScript** | 必须 |
| 样式 | **Tailwind CSS** | 配合 Duolingo 风的工具类很顺手 |
| 组件库 | **shadcn/ui** | 不用装包,代码进项目,易改 |
| 数据库+Auth | **Supabase** | Postgres + 内置 Auth + 行级安全策略,零运维 |
| ORM | **Supabase JS Client** | 直接操作,不引入额外 ORM |
| 状态管理 | **Zustand**(轻量场景)+ **React Query**(服务端状态) | 不用 Redux |
| 部署 | **Vercel** | Next.js 原配,免费额度够 MVP |
| 字体 | **Google Fonts: Nunito** + 系统中文 | 免授权 |

**项目结构建议**:
```
/app
  /(auth)/login/page.tsx
  /(auth)/register/page.tsx
  /(main)/page.tsx           # 首页
  /(main)/explore/page.tsx
  /(main)/q/[id]/page.tsx
  /(main)/q/[id]/debate/page.tsx
  /(main)/me/page.tsx
  /api/...
/components
  /ui/...                     # shadcn 基础
  /question-card.tsx
  /argument-card.tsx
  /vote-buttons.tsx
/lib
  /supabase.ts
  /utils.ts
/types
  /db.ts                      # 自动生成的 Supabase 类型
```

---

## 10. 题库初始化

MVP 上线时需要预置题目数据。  
请使用文件 `辩题题库_v0.3.md`(已附 51 题)进行 seed:

- 写一个 `scripts/seed-questions.ts` 脚本
- 把 51 题按以下分类映射:
  - "奇葩说原题" → category: `qipashuo`
  - "经典哲学思想实验" → category: `philosophy`
  - "Would You Rather" → category: `either-or`
  - "中文网络流传" → category: `internet`
- 每周从中选 7 道标记 `is_daily = true`,首页"每日一题"按日期轮播

---

## 11. 成功指标(MVP 阶段)

不追求 DAU,只追求**单用户深度**:

| 指标 | 目标 |
|------|------|
| 注册→首次投票转化率 | > 70% |
| 单次会话平均投票数 | > 3 题 |
| 投票后发表论点率 | > 15% |
| 论点平均点赞数 | > 1 |
| 立场切换率(看完反方观点改了立场) | 5-15% 是健康区间 |

种子用户阶段:朋友圈/微信群投放,目标 100 个真实用户,看上述指标分布。

---

## 12. Roadmap

| 阶段 | 时间 | 交付物 |
|------|------|------|
| **Sprint 0** | 1 周 | 工程搭建、Supabase 配置、基础路由跑通 |
| **Sprint 1** | 1 周 | 登录注册 + 首页 + 题目详情 + 投票完整闭环 |
| **Sprint 2** | 1 周 | 辩论页(双列+发论点+点赞)、个人中心 |
| **Sprint 3** | 0.5 周 | 提议新题 + 我的提议 + 管理员审核队列 |
| **Sprint 4** | 0.5 周 | Duolingo 视觉打磨、动画、移动端适配细节 |
| **Sprint 5** | 0.5 周 | 题库 seed、首页"每日一题"逻辑、上线 Vercel |
| **公测** | 持续 | 朋友圈/微信群投放,根据指标迭代 |

总计 **~4.5 周** 到 MVP 上线。

---

## 13. 风险与对策

| 风险 | 对策 |
|------|------|
| 内容空冷启动(没人发论点) | 预先编写 5-10 条"种子论点"植入每道题,看起来已有讨论 |
| 政治化倾向漂移(用户在论点里夹带) | MVP 阶段加敏感词过滤+人工巡查;长期用 AI 审核 |
| 注册流失高 | 简化到只要邮箱+密码+昵称,不强制邮箱验证 |
| 双列在窄屏不可读 | < 360px 自动降级为 Tab 切换 |
| 奇葩说题目版权 | MVP 阶段所有奇葩说原题改写表述,标注"灵感来源:奇葩说X季";直接用原文有风险 |
| 用户提议变成审核积压 | API 限流 3 题/天/人;管理员队列默认按"待审核最早"排序;后期可加自动预筛(关键词/AI) |
| 用户用提议入口绕过禁政治内容 | 审核必经人工;驳回理由模板里有"含政治/现实争议"快速选项;长期可加 AI 预审 |
| 管理员账号被滥用 | `is_admin` 只能在 Supabase 控制台 SQL 改;不暴露任何"自助升级"接口 |

---

## 14. 待用户拍板的事项(非阻塞)

这些可以先按 PRD 现有方案做,但用户后期需要确认:

1. **正式名称**:候选 ①「假设」 ②「二选一」 ③「BrainOn」 ④ 其他?
2. **域名**:`.com` / `.app` / `.cc`?
3. **Logo**:是否需要先生成一个简单图标?(可以用 emoji 占位:🧠)
4. **奇葩说题目处理**:全部改写还是保留原文?(改写更安全)
5. **首批种子论点**:是否需要 AI 帮忙生成 5-10 条/题?(强烈建议)
6. **未来商业化路径**:暂不设计,但是否预留"会员"概念字段?
7. **管理员账号设置**:MVP 阶段直接在 Supabase SQL 把你账号 `profiles.is_admin = true`(用户邮箱:kary09302005@gmail.com)

---

## 附录 A:产品调性 Mood Board(文字版)

- 看到的第一感觉:像 Duolingo,但是为大脑做的
- 按钮按下去:satisfying,有"嗒"的物理反馈感
- 颜色:绿色为锚点,周围环绕粉、蓝、黄、紫的多色点缀,像糖果店
- 文案口吻:不严肃、不学究、有一点皮("你确定被对方说服了?")
- 反例:不要做成知乎(太严肃)、不要做成微博(太喧闹)

## 附录 B:关键页面 Wireframe(简版描述)

**首页**:
```
[Logo 假设]                            [👤]
                                        
   ┌─────────────────────────────┐
   │                             │
   │  如果有按钮能看到伴侣有多爱你   │
   │  你按吗?                     │
   │                             │
   │   [✅ 支持]    [❌ 反对]       │
   │                             │
   │  · 来源:奇葩说 第5季         │
   └─────────────────────────────┘
   
   [🔄 换一道]
   
   分类:
   [奇葩说🟢] [思想实验🔵] [二选一🟡] [网络流传🟣]
```

**辩论页**:
```
← 题面(可折叠)
   投票:🟢支持 67% ────  🔴反对 33%
   
你投了支持方 [切换立场]

支持 ✅              反对 ❌
┌──────────┐         ┌──────────┐
│ @小明     │         │ @小红     │
│ 我觉得这   │         │ 知道太多反 │
│ 样可以减   │         │ 而会破坏   │
│ 少猜疑    │         │ 关系本身  │
│ ❤️ 23     │         │ ❤️ 18     │
└──────────┘         └──────────┘
┌──────────┐         ┌──────────┐
│ ...       │         │ ...       │
└──────────┘         └──────────┘

[💬 说说你的看法...]
```

---

**完。Claude Code 你接手吧。**

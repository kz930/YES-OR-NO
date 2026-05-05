# 假设 (YES OR NO)

> 5 分钟,一道脑洞题,先选边再开战。

一个让你为脑洞辩论投票、看观点、参与讨论的轻社区。只做思想实验和有趣的假设题,拒绝政治和现实争议。

完整产品需求见 [docs/PRD_假设_v0.2.md](docs/PRD_假设_v0.2.md)。

## 技术栈

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase** (Postgres + Auth + RLS)
- **TanStack Query** + **Zustand**

## 本地开发

```bash
# 1. 装依赖(已经装过的话跳过)
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 填入你的 Supabase URL 和 anon key

# 3. 跑数据库 migration
# 在 Supabase 控制台 → SQL editor 里执行 supabase/migrations/0001_init.sql

# 4. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 。

## 项目结构

```
/app                    Next.js App Router 路由
  /(auth)               登录/注册 (待建)
  /(main)               主应用 (待建)
  /api                  Route Handlers (待建)
/components             React 组件
  /ui                   shadcn/ui 基础组件
  providers.tsx         React Query + Toaster
/lib                    工具与客户端
  /supabase             浏览器 / 服务端 / 中间件 三个 client
  utils.ts              shadcn 自带的 cn()
/types
  db.ts                 数据库类型(MVP 前期手写,后期改用 supabase gen types)
/supabase/migrations    数据库迁移 SQL
/docs                   PRD + 题库
middleware.ts           Supabase session 刷新 + 路由守卫
```

## Roadmap

| Sprint | 内容 |
|---|---|
| **0** ✅ | 工程脚手架 |
| **1** | 登录注册 + 首页 + 题目详情 + 投票闭环 |
| **2** | 辩论页(双列+论点+点赞)+ 个人中心 |
| **3** | 题目提议 + 我的提议 + 管理员审核 |
| **4** | 视觉打磨、动画、移动端适配 |
| **5** | 题库 seed + 每日一题 + 部署上线 |

## 给自己设管理员

跑完 migration、注册账号后,在 Supabase SQL editor 执行:

```sql
update profiles set is_admin = true where email = 'kary09302005@gmail.com';
```

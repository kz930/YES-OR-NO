# YES OR NO

> A thought experiment a day. Which side are you on?

A lightweight community for voting on hypothetical dilemmas, reading opposing arguments, and debating with strangers. Strictly thought experiments and "would you rather" questions (trolley problem, brain in a vat, Little Mermaid choosing foam vs eternal soul, etc.) — no real-world politics or current events.

Full product spec: [docs/PRD_假设_v0.2.md](docs/PRD_假设_v0.2.md).

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS 4** + **shadcn/ui** + **Motion (framer-motion)**
- **Supabase** (Postgres + Auth + RLS + Storage)
- **TanStack Query** + **Zustand** + **Sonner**

## Features

- **Home gachapon card** — Pulls one random question you haven't voted on yet. Vote, see the split, jump into the debate or skip to the next.
- **Swipe deck** — Tinder-style cards: swipe left = YES, swipe right = NO, tap × to skip.
- **Explore** — Browse the full question bank by category, with search and sort.
- **Debate page** — After voting, a two-column argument view (your side vs the opposite). Each argument can be upvoted and replied to as a nested thread.
- **Suggest a question** — Users submit their own hypotheticals (3/day cap). Admins review before publishing.
- **Profile (`/me`)** — Your votes, likes, suggestions, and account settings.
- **Public profile (`/u/[nickname]`)** — See what someone else voted and the arguments they've posted.
- **Feedback** — In-app bug reports and ideas, with an admin resolution flow.
- **Admin panel** — Suggestion review queue, feedback inbox, plus SQL-driven question edits.

## Local development

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env.local
# Fill in your Supabase URL / anon key / service role key

# 3. Run migrations
# In Supabase console → SQL editor, run supabase/migrations/*.sql in order

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000.

## Project layout

```
/app
  /(auth)               Login / register
  /(main)               Main app
    page.tsx              Home gachapon card
    swipe/                Swipe deck
    explore/              Browse all
    q/[id]/               Question detail + /debate page
    suggest/              Submit a question
    me/                   Personal profile
    u/[nickname]/         Public profile
    feedback/             User feedback
    admin/                Admin panel
  /api                    Route Handlers (vote / like / argument / suggestion / feedback / admin)
/components
  gachapon-card.tsx       Home vote card + post-vote state
  swipe-stack.tsx         Swipe deck (Motion drag)
  vote-buttons.tsx        Question-detail voting
  comment-thread.tsx      Nested argument threads
  /ui                     shadcn/ui primitives
/lib/supabase             Browser / server / middleware clients
/types/db.ts              DB types (hand-written for now; will switch to supabase gen types later)
/supabase/migrations      Database migration SQL
middleware.ts             Supabase session refresh + route guards
```

## Deployment

Currently deployed on Vercel. Mainland China users need a VPN to reach it — the ICP filing route isn't worth it at this scale yet.

## Granting admin

After the owner signs up, an admin flag is flipped manually in the database. (Not documenting the exact query here on purpose.)

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GachaponCard } from "@/components/gachapon-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Strategy: prefer a random question the user hasn't voted on yet.
  // Falls back to any published question if all have been voted.
  const { data: votedRows } = await supabase
    .from("votes")
    .select("question_id")
    .eq("user_id", user!.id);

  const votedIds = (votedRows ?? []).map((v) => v.question_id);

  let qb = supabase
    .from("questions")
    .select(
      "id, title, source, source_detail, side_a_label, side_b_label, likes_count"
    )
    .eq("status", "published");

  if (votedIds.length > 0) {
    qb = qb.not("id", "in", `(${votedIds.join(",")})`);
  }

  const { data: candidates } = await qb;

  let question = candidates && candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : undefined;

  // All voted? Just show a recent one.
  if (!question) {
    const { data: fallback } = await supabase
      .from("questions")
      .select("id, title, source, source_detail, side_a_label, side_b_label, likes_count")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1);
    question = fallback?.[0];
  }

  let liked = false;
  if (question) {
    const { data: likeRow } = await supabase
      .from("question_likes")
      .select("user_id")
      .eq("user_id", user!.id)
      .eq("question_id", question.id)
      .maybeSingle();
    liked = !!likeRow;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 pb-12 pt-10">
      <section>
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            今天聊聊 · A question for you
          </p>
          <Link
            href="/explore"
            className="text-xs font-medium text-forest hover:underline"
          >
            浏览全部 →
          </Link>
        </div>

        <div className="mt-5">
          {question ? (
            <GachaponCard question={question} liked={liked} />
          ) : (
            <article className="rounded-[28px] bg-card p-10 text-center text-ink-soft ring-1 ring-border/50">
              题库还是空的,先在 Supabase SQL editor 跑 0003_seed_sample_questions.sql。
            </article>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/swipe"
          className="group flex items-center justify-between rounded-2xl bg-gradient-to-br from-blossom/40 to-sky/40 p-5 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <p className="text-sm font-semibold text-ink">随便逛</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              一张张滑过去 · Tinder 模式
            </p>
          </div>
          <span className="text-2xl">🃏</span>
        </Link>
        <Link
          href="/suggest"
          className="group flex items-center justify-between rounded-2xl bg-cream-2 p-5 transition-colors hover:bg-jade/30"
        >
          <div>
            <p className="text-sm font-semibold text-ink">
              有想问的脑洞?
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              提议一道题 · 每天 3 题上限
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-lg font-bold text-white transition-transform group-hover:scale-110">
            +
          </span>
        </Link>
      </div>
    </main>
  );
}

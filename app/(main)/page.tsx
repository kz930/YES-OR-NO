import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: dailyQuestions } = await supabase
    .from("questions")
    .select("id, title, source, source_detail, side_a_label, side_b_label, category_id")
    .eq("status", "published")
    .eq("is_daily", true)
    .limit(1);

  let question = dailyQuestions?.[0];
  if (!question) {
    const { data: fallback } = await supabase
      .from("questions")
      .select("id, title, source, source_detail, side_a_label, side_b_label, category_id")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1);
    question = fallback?.[0];
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <section>
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            今天聊聊 · Today
          </p>
          <Link
            href="/explore"
            className="text-xs font-medium text-forest hover:underline"
          >
            浏览全部 →
          </Link>
        </div>

        {question ? (
          <article className="mt-3 rounded-[28px] bg-card p-8 shadow-[0_2px_24px_-8px_rgba(31,42,36,0.08)] ring-1 ring-border/50 sm:p-10">
            <h2 className="text-[28px] font-semibold leading-[1.25] -tracking-[0.01em] text-ink sm:text-[32px]">
              {question.title}
            </h2>
            {question.source && (
              <p className="mt-4 text-xs uppercase tracking-wider text-ink-soft">
                · {question.source}
                {question.source_detail ? ` · ${question.source_detail}` : ""}
              </p>
            )}

            <div className="mt-10 grid grid-cols-2 gap-3">
              <Link
                href={`/q/${question.id}?side=a`}
                className="flex h-16 flex-col items-center justify-center rounded-2xl bg-forest text-white transition-all hover:bg-forest-2 active:scale-[0.97]"
              >
                <span className="text-base font-bold tracking-tight">YES</span>
                <span className="text-[11px] font-medium opacity-90">
                  {question.side_a_label}
                </span>
              </Link>
              <Link
                href={`/q/${question.id}?side=b`}
                className="flex h-16 flex-col items-center justify-center rounded-2xl bg-blossom text-mulberry transition-all hover:bg-blossom-2 hover:text-white active:scale-[0.97]"
              >
                <span className="text-base font-bold tracking-tight">NO</span>
                <span className="text-[11px] font-medium opacity-90">
                  {question.side_b_label}
                </span>
              </Link>
            </div>
          </article>
        ) : (
          <article className="mt-3 rounded-[28px] bg-card p-10 text-center text-ink-soft ring-1 ring-border/50">
            题库还是空的,先在 Supabase SQL editor 跑 0003_seed_sample_questions.sql。
          </article>
        )}
      </section>

      <Link
        href="/suggest"
        className="group flex items-center justify-between rounded-2xl bg-cream-2 p-5 transition-colors hover:bg-jade/30"
      >
        <div>
          <p className="text-sm font-semibold text-ink">
            有想问的脑洞?
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            提议一道题,通过审核后会加入题库 · 每天 3 题上限
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-lg font-bold text-white transition-transform group-hover:scale-110">
          +
        </span>
      </Link>
    </main>
  );
}

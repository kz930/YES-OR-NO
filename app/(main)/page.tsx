import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_PALETTE: Record<string, { bg: string; text: string; emoji: string }> = {
  qipashuo:   { bg: "#DBF68F", text: "#1F2A24", emoji: "🎤" },
  philosophy: { bg: "#C7DFF9", text: "#1F2A24", emoji: "🧠" },
  "either-or": { bg: "#D7C7ED", text: "#1F2A24", emoji: "🔀" },
  internet:   { bg: "#F9D9C3", text: "#1F2A24", emoji: "💭" },
};

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

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("display_order");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-10">
      <section>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-ink-soft">
          Today&rsquo;s prompt · 今日一题
        </p>

        {question ? (
          <article className="mt-3 rounded-[28px] bg-card p-8 shadow-[0_2px_24px_-8px_rgba(31,42,36,0.08)] ring-1 ring-border/50 sm:p-10">
            <h2 className="font-display text-3xl font-medium leading-[1.25] text-ink sm:text-4xl">
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
                className="group flex h-16 items-center justify-center rounded-2xl bg-forest text-lg font-bold tracking-wide text-white transition-all hover:bg-forest-2 active:scale-[0.97]"
              >
                <span className="font-display italic text-xl mr-2">YES</span>
                <span className="text-sm font-semibold">{question.side_a_label}</span>
              </Link>
              <Link
                href={`/q/${question.id}?side=b`}
                className="group flex h-16 items-center justify-center rounded-2xl bg-blossom text-lg font-bold tracking-wide text-mulberry transition-all hover:bg-blossom-2 hover:text-white active:scale-[0.97]"
              >
                <span className="font-display italic text-xl mr-2">NO</span>
                <span className="text-sm font-semibold">{question.side_b_label}</span>
              </Link>
            </div>
          </article>
        ) : (
          <article className="mt-3 rounded-[28px] bg-card p-10 text-center text-ink-soft ring-1 ring-border/50">
            题库还是空的,先在 Supabase SQL editor 跑 0003_seed_sample_questions.sql。
          </article>
        )}
      </section>

      <section>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-ink-soft">
          Browse · 分类
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {categories?.map((cat) => {
            const palette = CATEGORY_PALETTE[cat.slug] ?? {
              bg: "#92C3A5",
              text: "#1F2A24",
              emoji: "✨",
            };
            return (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.slug}`}
                className="group flex flex-col justify-between rounded-3xl p-5 h-32 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ backgroundColor: palette.bg, color: palette.text }}
              >
                <span className="text-2xl">{palette.emoji}</span>
                <span className="font-display text-lg font-medium leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

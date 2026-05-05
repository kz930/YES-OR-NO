import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: question }, { data: vote }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, title, side_a_label, side_b_label")
      .eq("id", questionId)
      .single(),
    supabase
      .from("votes")
      .select("current_side")
      .eq("user_id", user!.id)
      .eq("question_id", questionId)
      .maybeSingle(),
  ]);

  if (!question) notFound();

  const mySide = vote?.current_side ?? null;
  const myLabel = mySide === "a" ? question.side_a_label : mySide === "b" ? question.side_b_label : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <article>
        <h1 className="text-2xl font-semibold leading-snug -tracking-[0.01em] text-ink sm:text-3xl">
          {question.title}
        </h1>
        {mySide && myLabel && (
          <p className="mt-3 text-sm text-ink-soft">
            你投了{" "}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-semibold ${
                mySide === "a"
                  ? "bg-forest text-white"
                  : "bg-blossom text-mulberry"
              }`}
            >
              <span className="font-bold tracking-tight">{mySide === "a" ? "YES" : "NO"}</span>
              <span>{myLabel}</span>
            </span>
          </p>
        )}
      </article>

      <section className="rounded-3xl bg-card p-10 text-center ring-1 ring-border/50">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Coming in Sprint 2
        </p>
        <p className="mt-3 text-base text-ink-soft">
          双列论点墙将在下个 Sprint 完成。
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          目前你的投票已经写入数据库。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-forest-2"
        >
          回到首页
        </Link>
      </section>
    </main>
  );
}

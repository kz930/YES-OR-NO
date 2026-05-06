import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CommentThread } from "@/components/comment-thread";
import { QuestionLikeButton } from "@/components/question-like-button";

export default async function DebatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort } = await searchParams;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) notFound();

  const orderByLikes = sort !== "time";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: question },
    { data: vote },
    { data: arguments_ },
    { data: questionLike },
  ] = await Promise.all([
    supabase
      .from("questions")
      .select("id, title, side_a_label, side_b_label, likes_count, votes_count, arguments_count")
      .eq("id", questionId)
      .single(),
    supabase
      .from("votes")
      .select("current_side")
      .eq("user_id", user!.id)
      .eq("question_id", questionId)
      .maybeSingle(),
    // NOTE: is_anonymous omitted from explicit select to dodge a stale
    // PostgREST schema cache after migration 0009. We read the whole row
    // with `*` so the column comes through if the cache is fresh, and
    // fall back to false if the property is undefined.
    supabase
      .from("arguments")
      .select(`*, profiles(nickname, avatar_url)`)
      .eq("question_id", questionId)
      .order(orderByLikes ? "likes_count" : "created_at", { ascending: false })
      .limit(100),
    supabase
      .from("question_likes")
      .select("user_id")
      .eq("user_id", user!.id)
      .eq("question_id", questionId)
      .maybeSingle(),
  ]);

  if (!question) notFound();

  const mySide = vote?.current_side ?? null;
  const myLabel = mySide === "a" ? question.side_a_label : mySide === "b" ? question.side_b_label : null;

  // Compute YES/NO vote split for the bar
  const { count: yesCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("question_id", questionId)
    .eq("current_side", "a");

  const total = question.votes_count ?? 0;
  const yesPct = total > 0 ? Math.round(((yesCount ?? 0) / total) * 100) : 50;
  const noPct = 100 - yesPct;

  // My liked argument ids
  const argIds = (arguments_ ?? []).map((a) => a.id);
  const { data: myArgLikes } = argIds.length
    ? await supabase
        .from("argument_likes")
        .select("argument_id")
        .eq("user_id", user!.id)
        .in("argument_id", argIds)
    : { data: [] };
  const likedArgs = new Set((myArgLikes ?? []).map((r) => r.argument_id));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-8">
      <article className="rounded-3xl bg-card p-6 ring-1 ring-border/50">
        <h1 className="text-xl font-semibold leading-snug -tracking-[0.01em] text-ink sm:text-2xl">
          {question.title}
        </h1>

        {/* Vote split bar */}
        {total > 0 ? (
          <div className="mt-5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-cream-2">
              <div
                className="h-full bg-forest transition-all"
                style={{ width: `${yesPct}%` }}
              />
              <div
                className="h-full bg-blossom transition-all"
                style={{ width: `${noPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-ink-soft">
              <span className="text-forest">YES {yesPct}%</span>
              <span className="text-mulberry">{noPct}% NO</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">还没有人投票呢。</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          {mySide && myLabel ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                mySide === "a" ? "bg-forest text-white" : "bg-blossom text-mulberry"
              }`}
            >
              <span className="font-bold tracking-tight">{mySide === "a" ? "YES" : "NO"}</span>
              <span>· 你投了「{myLabel}」</span>
            </span>
          ) : (
            <span />
          )}
          <QuestionLikeButton
            questionId={question.id}
            initialLiked={!!questionLike}
            initialCount={question.likes_count ?? 0}
          />
        </div>
      </article>

      {mySide ? (
        <CommentThread
          questionId={question.id}
          mySide={mySide}
          myLabel={myLabel ?? ""}
          sideALabel={question.side_a_label}
          sideBLabel={question.side_b_label}
          initialArguments={(arguments_ ?? []).map((a) => ({
            id: a.id,
            content: a.content,
            side: a.side,
            likes_count: a.likes_count,
            is_anonymous: a.is_anonymous ?? false,
            created_at: a.created_at,
            // Supabase types FK joins as either array or object
            nickname:
              (Array.isArray(a.profiles) ? a.profiles[0]?.nickname : (a.profiles as { nickname?: string } | null)?.nickname) ?? "用户",
            avatar_url:
              (Array.isArray(a.profiles) ? a.profiles[0]?.avatar_url : (a.profiles as { avatar_url?: string | null } | null)?.avatar_url) ?? null,
            initiallyLiked: likedArgs.has(a.id),
          }))}
          sortMode={orderByLikes ? "likes" : "time"}
        />
      ) : (
        <div className="rounded-2xl bg-card p-8 text-center text-sm text-ink-soft ring-1 ring-border/50">
          要看大家的讨论,
          <Link href={`/q/${question.id}`} className="font-semibold text-forest hover:underline">
            先投个票
          </Link>
          。
        </div>
      )}
    </main>
  );
}

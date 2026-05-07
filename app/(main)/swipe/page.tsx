import { createClient } from "@/lib/supabase/server";
import { SwipeStack } from "@/components/swipe-stack";

export const dynamic = "force-dynamic";

export default async function SwipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pull questions the user hasn't voted on yet.
  const { data: votedRows } = await supabase
    .from("votes")
    .select("question_id")
    .eq("user_id", user!.id);
  const votedIds = (votedRows ?? []).map((v) => v.question_id);

  let qb = supabase
    .from("questions")
    .select(`
      id, title, source, source_detail, side_a_label, side_b_label,
      likes_count, votes_count, arguments_count,
      categories(slug, name)
    `)
    .eq("status", "published");

  if (votedIds.length > 0) {
    qb = qb.not("id", "in", `(${votedIds.join(",")})`);
  }

  const { data: rows } = await qb.limit(30);

  // Shuffle in place — feels more random across visits than DB order
  const stack = (rows ?? [])
    .map((r) => ({
      ...r,
      categoryName: Array.isArray(r.categories)
        ? r.categories[0]?.name ?? null
        : (r.categories as { name?: string } | null)?.name ?? null,
      categorySlug: Array.isArray(r.categories)
        ? r.categories[0]?.slug ?? null
        : (r.categories as { slug?: string } | null)?.slug ?? null,
    }))
    .sort(() => Math.random() - 0.5);

  // Pre-fetch which ones I already liked (so heart starts filled)
  const ids = stack.map((q) => q.id);
  const { data: myLikes } = ids.length
    ? await supabase
        .from("question_likes")
        .select("question_id")
        .eq("user_id", user!.id)
        .in("question_id", ids)
    : { data: [] };
  const likedSet = new Set((myLikes ?? []).map((r) => r.question_id));

  const cards = stack.map((q) => ({
    id: q.id,
    title: q.title,
    source: q.source,
    sourceDetail: q.source_detail,
    sideALabel: q.side_a_label,
    sideBLabel: q.side_b_label,
    likesCount: q.likes_count ?? 0,
    votesCount: q.votes_count ?? 0,
    argumentsCount: q.arguments_count ?? 0,
    categoryName: q.categoryName,
    categorySlug: q.categorySlug,
    initiallyLiked: likedSet.has(q.id),
  }));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-12 pt-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          随便逛 · Swipe
        </p>
        <h1 className="mt-1 text-2xl font-semibold -tracking-[0.01em] text-ink">
          一张张翻过去
        </h1>
        <p className="mt-1.5 text-xs text-ink-soft">
          左滑 YES · 右滑 NO · 点卡片看详情
        </p>
      </div>

      <SwipeStack cards={cards} />
    </main>
  );
}

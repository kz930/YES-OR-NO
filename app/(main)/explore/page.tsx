import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let categoryId: number | null = null;
  let categoryName: string | null = null;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id, name")
      .eq("slug", categorySlug)
      .single();
    if (cat) {
      categoryId = cat.id;
      categoryName = cat.name;
    }
  }

  let qb = supabase
    .from("questions")
    .select("id, title, source, source_detail, category_id, is_daily")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (categoryId !== null) {
    qb = qb.eq("category_id", categoryId);
  }

  const { data: questions } = await qb;

  const ids = (questions ?? []).map((q) => q.id);
  const { data: myVotes } = ids.length
    ? await supabase
        .from("votes")
        .select("question_id, current_side")
        .eq("user_id", user!.id)
        .in("question_id", ids)
    : { data: [] };

  const votedMap = new Map(
    (myVotes ?? []).map((v) => [v.question_id, v.current_side])
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          {categoryName ? "分类" : "全部题目"}
        </p>
        {categoryName && (
          <h1 className="mt-1 text-2xl font-semibold -tracking-[0.01em] text-ink">
            {categoryName}
          </h1>
        )}
      </div>

      {questions && questions.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {questions.map((q) => {
            const myVote = votedMap.get(q.id);
            const href = myVote ? `/q/${q.id}/debate` : `/q/${q.id}`;
            return (
              <li key={q.id}>
                <Link
                  href={href}
                  className="block rounded-2xl bg-card p-5 ring-1 ring-border/50 transition-all hover:ring-forest/40 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold leading-snug text-ink">
                      {q.title}
                    </h3>
                    {myVote && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          myVote === "a"
                            ? "bg-forest/15 text-forest"
                            : "bg-blossom/40 text-mulberry"
                        }`}
                      >
                        已投 {myVote === "a" ? "YES" : "NO"}
                      </span>
                    )}
                  </div>
                  {q.source && (
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-soft">
                      · {q.source}
                      {q.source_detail ? ` · ${q.source_detail}` : ""}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-card p-10 text-center text-sm text-ink-soft ring-1 ring-border/50">
          这个分类还没有题目。
        </div>
      )}
    </main>
  );
}

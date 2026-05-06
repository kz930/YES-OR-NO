import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Heart } from "@/components/icons/heart";

type Sort = "latest" | "popular" | "liked" | "discussed";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "latest",   label: "最新" },
  { value: "popular",  label: "最多投票" },
  { value: "liked",    label: "最多喜欢" },
  { value: "discussed", label: "最多讨论" },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: Sort }>;
}) {
  const { category: categorySlug, sort: rawSort } = await searchParams;
  const sort: Sort = SORT_OPTIONS.some((s) => s.value === rawSort)
    ? (rawSort as Sort)
    : "latest";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .select(
      "id, title, source, source_detail, category_id, likes_count, votes_count, arguments_count"
    )
    .eq("status", "published");

  if (categoryId !== null) qb = qb.eq("category_id", categoryId);

  switch (sort) {
    case "popular":
      qb = qb.order("votes_count", { ascending: false });
      break;
    case "liked":
      qb = qb.order("likes_count", { ascending: false });
      break;
    case "discussed":
      qb = qb.order("arguments_count", { ascending: false });
      break;
    default:
      qb = qb.order("created_at", { ascending: false });
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
  const votedMap = new Map((myVotes ?? []).map((v) => [v.question_id, v.current_side]));

  const baseQs = categorySlug ? `category=${categorySlug}&` : "";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          {categoryName ? "分类 · Category" : "全部题目 · Browse"}
        </p>
        {categoryName && (
          <h1 className="mt-1 text-2xl font-semibold -tracking-[0.01em] text-ink">
            {categoryName}
          </h1>
        )}

        <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === sort;
            return (
              <Link
                key={opt.value}
                href={`/explore?${baseQs}sort=${opt.value}`}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? "bg-ink text-cream"
                    : "bg-cream-2 text-ink-soft hover:text-ink"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
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

                  <div className="mt-3 flex items-center gap-4 text-[11px] font-medium text-ink-soft">
                    <Stat icon="🗳" value={q.votes_count ?? 0} label="投" />
                    <Stat
                      icon={<Heart className="h-3 w-3" />}
                      value={q.likes_count ?? 0}
                      label="喜欢"
                    />
                    <Stat icon="💬" value={q.arguments_count ?? 0} label="讨论" />
                    {q.source && (
                      <span className="ml-auto truncate uppercase tracking-wider">
                        {q.source}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-card p-10 text-center text-sm text-ink-soft ring-1 ring-border/50">
          这里还没有题目。
        </div>
      )}
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-sm">{icon}</span>
      <span className="font-bold text-ink">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

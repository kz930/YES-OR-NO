import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "@/components/icons/heart";
import { paletteFor } from "@/lib/category-palette";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ nickname: string }>;
}) {
  const { nickname: rawNickname } = await params;
  const nickname = decodeURIComponent(rawNickname);

  const supabase = await createClient();

  // IMPORTANT: never select 'email' here. This is a public-facing page
  // and exposing email would leak user PII to anyone who can guess
  // the URL.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, is_admin, created_at")
    .eq("nickname", nickname)
    .maybeSingle();

  if (!profile) notFound();

  // Public stats: votes, comments, likes
  const [
    { count: voteCount },
    { count: argumentCount },
    { count: receivedLikes },
    { data: likedRows },
  ] = await Promise.all([
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("arguments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_anonymous", false),
    supabase
      .from("arguments")
      .select("likes_count.sum()")
      .eq("user_id", profile.id)
      .eq("is_anonymous", false),
    supabase
      .from("question_likes")
      .select(`
        questions(id, title, source, source_detail,
          categories(slug, name)
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  type FavRow = {
    id: number;
    title: string;
    source: string | null;
    source_detail: string | null;
    categorySlug: string | null;
    categoryName: string | null;
  };

  const favorites: FavRow[] = (likedRows ?? [])
    .map((row) => {
      const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
      if (!q) return null;
      const cat = Array.isArray(q.categories) ? q.categories[0] : q.categories;
      return {
        id: q.id,
        title: q.title,
        source: q.source,
        source_detail: q.source_detail,
        categorySlug: cat?.slug ?? null,
        categoryName: cat?.name ?? null,
      };
    })
    .filter((x): x is FavRow => x !== null);

  // received likes is { sum } from aggregate
  const totalLikes =
    Array.isArray(receivedLikes) && receivedLikes[0]?.sum
      ? Number(receivedLikes[0].sum)
      : 0;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
        Profile
      </p>

      <section className="mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-jade/40 via-cream-2 to-sour/40 p-8">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 ring-4 ring-cream">
            {profile.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.nickname} />
            )}
            <AvatarFallback className="bg-forest text-2xl font-bold text-white">
              {profile.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-2xl font-semibold -tracking-[0.01em] text-ink">
                {profile.nickname}
              </h2>
              {profile.is_admin && (
                <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold text-white">
                  管理员
                </span>
              )}
            </div>
            <p className="text-xs text-ink-soft">
              加入于 {new Date(profile.created_at).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Stat label="投票" value={voteCount ?? 0} />
          <Stat label="评论" value={argumentCount ?? 0} />
          <Stat label="收到的赞" value={totalLikes} />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Heart className="h-4 w-4 fill-blossom-2 text-blossom-2" />
          {profile.nickname} 喜欢的题
          <span className="text-xs font-normal text-ink-soft">
            · {favorites.length}
          </span>
        </h3>

        {favorites.length > 0 ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {favorites.map((f) => {
              const palette = paletteFor(f.categorySlug);
              return (
                <li key={f.id}>
                  <Link
                    href={`/q/${f.id}`}
                    className="group flex h-full flex-col justify-between rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: palette.bg }}
                  >
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: palette.accent }}
                      >
                        {palette.emoji} {f.categoryName ?? ""}
                      </span>
                      <h4 className="mt-2 text-sm font-semibold leading-snug text-ink line-clamp-3">
                        {f.title}
                      </h4>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl bg-card p-8 text-center text-sm text-ink-soft ring-1 ring-border/50">
            还没喜欢过任何题。
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-cream-2 p-4">
      <div className="text-2xl font-bold -tracking-[0.02em] text-ink">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] tracking-wider text-ink-soft">
        {label}
      </div>
    </div>
  );
}

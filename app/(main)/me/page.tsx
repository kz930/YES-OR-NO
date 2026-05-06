import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "@/components/icons/heart";
import { paletteFor } from "@/lib/category-palette";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const [
    { count: voteCount },
    { count: argumentCount },
    { count: suggestionCount },
    { data: likedRows },
  ] = await Promise.all([
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("arguments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("question_suggestions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("question_likes")
      .select(`
        created_at,
        questions(id, title, source, source_detail,
          categories(slug, name)
        )
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(30),
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

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
        Profile · 个人中心
      </p>

      <section className="mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-jade/40 via-cream-2 to-sour/40 p-8">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 ring-4 ring-cream">
            {profile?.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.nickname} />
            )}
            <AvatarFallback className="bg-forest text-2xl font-bold text-white">
              {profile?.nickname?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold -tracking-[0.01em] text-ink">
              {profile?.nickname}
            </h2>
            <p className="text-sm text-ink-soft">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Stat label="投票" value={voteCount ?? 0} />
          <Stat label="评论" value={argumentCount ?? 0} />
          <Stat label="提议" value={suggestionCount ?? 0} />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Heart className="h-4 w-4 fill-blossom-2 text-blossom-2" />
            我喜欢的题
            <span className="text-xs font-normal text-ink-soft">
              · {favorites.length}
            </span>
          </h3>
          <Link
            href="/me/suggestions"
            className="text-xs font-medium text-forest hover:underline"
          >
            我提议的题 →
          </Link>
        </div>

        {favorites.length > 0 ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {favorites.map((f) => {
              const palette = paletteFor(f.categorySlug);
              return (
                <li key={f.id}>
                  <Link
                    href={`/q/${f.id}/debate`}
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
                    {f.source && (
                      <p className="mt-3 text-[10px] uppercase tracking-wider text-ink-soft">
                        · {f.source}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl bg-card p-8 text-center text-sm text-ink-soft ring-1 ring-border/50">
            还没喜欢过题。在
            <Link href="/swipe" className="mx-1 font-semibold text-forest hover:underline">
              随便逛
            </Link>
            或讨论页点心形,题就会收到这里。
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
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

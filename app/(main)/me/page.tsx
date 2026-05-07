import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/profile-editor";
import { ProfileLists, type FavRow, type AnsweredRow } from "@/components/profile-lists";

export const dynamic = "force-dynamic";

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
    { data: answeredRows },
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
      .limit(50),
    supabase
      .from("votes")
      .select(`
        current_side,
        created_at,
        questions(id, title, side_a_label, side_b_label,
          categories(slug, name)
        )
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

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

  const answered: AnsweredRow[] = (answeredRows ?? [])
    .map((row) => {
      const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
      if (!q) return null;
      const cat = Array.isArray(q.categories) ? q.categories[0] : q.categories;
      return {
        id: q.id,
        title: q.title,
        side: row.current_side as "a" | "b",
        sideALabel: q.side_a_label,
        sideBLabel: q.side_b_label,
        categorySlug: cat?.slug ?? null,
        categoryName: cat?.name ?? null,
      };
    })
    .filter((x): x is AnsweredRow => x !== null);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
        Profile · 个人中心
      </p>

      <section className="mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-jade/40 via-cream-2 to-sour/40 p-8">
        <ProfileEditor
          userId={user!.id}
          initialNickname={profile?.nickname ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? null}
          email={profile?.email ?? ""}
        />

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Stat label="投票" value={voteCount ?? 0} />
          <Stat label="评论" value={argumentCount ?? 0} />
          <Stat label="提议" value={suggestionCount ?? 0} />
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <Link
          href="/me/suggestions"
          className="text-xs font-medium text-forest hover:underline"
        >
          我提议的题 →
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <ProfileLists favorites={favorites} answered={answered} />
      </div>
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

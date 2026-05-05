import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const [{ count: voteCount }, { count: argumentCount }] = await Promise.all([
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("arguments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
      <p className="font-display text-xs uppercase tracking-[0.25em] text-ink-soft">
        Profile · 个人中心
      </p>

      <section className="mt-3 rounded-3xl bg-card p-8 ring-1 ring-border/50">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 ring-2 ring-cream-2">
            {profile?.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.nickname} />
            )}
            <AvatarFallback className="bg-jade text-2xl font-display font-bold text-white">
              {profile?.nickname?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-display text-2xl font-medium text-ink">
              {profile?.nickname}
            </h2>
            <p className="text-sm text-ink-soft">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Votes · 投票" value={voteCount ?? 0} accent="forest" />
          <Stat label="Arguments · 论点" value={argumentCount ?? 0} accent="blossom" />
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "forest" | "blossom";
}) {
  return (
    <div className="rounded-2xl bg-cream-2 p-5 text-center">
      <div
        className={`font-display text-3xl font-bold ${
          accent === "forest" ? "text-forest" : "text-mulberry"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-ink-soft">
        {label}
      </div>
    </div>
  );
}

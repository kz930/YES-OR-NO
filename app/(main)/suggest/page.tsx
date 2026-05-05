import { createClient } from "@/lib/supabase/server";
import { SuggestForm } from "@/components/suggest-form";

export default async function SuggestPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("display_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Count pending suggestions in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: pendingCount } = await supabase
    .from("question_suggestions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("status", "pending")
    .gte("created_at", since);

  const remaining = Math.max(0, 3 - (pendingCount ?? 0));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Submit · 提一题
        </p>
        <h1 className="mt-1 text-3xl font-semibold -tracking-[0.01em] text-ink">
          想问大家什么?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          提议一道题,通过审核后会加入题库,所有人都能投票讨论。
          <br />
          政治 / 现实争议类内容会被驳回。每天最多 3 题,你今天还能提 {remaining} 题。
        </p>
      </div>

      <div className="rounded-3xl bg-card p-6 ring-1 ring-border/50 sm:p-8">
        <SuggestForm
          categories={categories ?? []}
          remaining={remaining}
        />
      </div>
    </main>
  );
}

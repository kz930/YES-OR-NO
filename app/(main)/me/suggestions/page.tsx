import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:  { label: "待审核", className: "bg-sunflower text-ink" },
  approved: { label: "已通过", className: "bg-forest text-white" },
  rejected: { label: "未通过", className: "bg-blossom-2 text-white" },
};

export default async function MySuggestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("question_suggestions")
    .select(`
      id, title, status, reviewer_note, approved_question_id, created_at,
      categories(name)
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            My submissions · 我的提议
          </p>
          <h1 className="mt-1 text-2xl font-semibold -tracking-[0.01em] text-ink">
            等待审核中
          </h1>
        </div>
        <Link
          href="/suggest"
          className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-2"
        >
          + 再提一题
        </Link>
      </div>

      {rows && rows.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
            // Supabase returns categories as an array even with single FK
            const catName = Array.isArray(row.categories)
              ? row.categories[0]?.name
              : (row.categories as { name?: string } | null)?.name;
            return (
              <li
                key={row.id}
                className="rounded-2xl bg-card p-5 ring-1 ring-border/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-snug text-ink">
                    {row.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-soft">
                  {catName ?? "—"} · {new Date(row.created_at).toLocaleDateString("zh-CN")}
                </p>
                {row.status === "rejected" && row.reviewer_note && (
                  <p className="mt-3 rounded-lg bg-blossom/30 px-3 py-2 text-xs text-mulberry">
                    驳回理由:{row.reviewer_note}
                  </p>
                )}
                {row.status === "approved" && row.approved_question_id && (
                  <Link
                    href={`/q/${row.approved_question_id}`}
                    className="mt-3 inline-block text-xs font-semibold text-forest hover:underline"
                  >
                    去看大家怎么投 →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-card p-10 text-center text-sm text-ink-soft ring-1 ring-border/50">
          还没提过题。{" "}
          <Link href="/suggest" className="font-semibold text-forest hover:underline">
            去提一题
          </Link>
        </div>
      )}
    </main>
  );
}

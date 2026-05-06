import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminSuggestionRow } from "@/components/admin-suggestion-row";

type Status = "pending" | "approved" | "rejected";

const TABS: { value: Status; label: string }[] = [
  { value: "pending",  label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已驳回" },
];

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: Status }>;
}) {
  const ctx = await requireAdmin();
  // 3rd defense layer: pretend the page doesn't exist for non-admins.
  // Frontend (this page) + API gates + RLS together.
  if (!ctx) notFound();

  const { status: rawStatus } = await searchParams;
  const status: Status = TABS.some((t) => t.value === rawStatus)
    ? (rawStatus as Status)
    : "pending";

  const { data: rows } = await ctx.supabase
    .from("question_suggestions")
    .select(`
      id, title, description, side_a_label, side_b_label, source,
      status, reviewer_note, approved_question_id, is_anonymous, created_at,
      categories(slug, name),
      profiles:user_id(nickname, avatar_url)
    `)
    .eq("status", status)
    .order("created_at", { ascending: status === "pending" });

  const items = (rows ?? []).map((r) => {
    const cat = Array.isArray(r.categories) ? r.categories[0] : r.categories;
    const proposer = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      sideALabel: r.side_a_label,
      sideBLabel: r.side_b_label,
      source: r.source,
      status: r.status as Status,
      reviewerNote: r.reviewer_note,
      approvedQuestionId: r.approved_question_id,
      isAnonymous: r.is_anonymous ?? false,
      createdAt: r.created_at,
      categoryName: cat?.name ?? null,
      proposerNickname: (proposer as { nickname?: string } | null)?.nickname ?? "?",
      proposerAvatar: (proposer as { avatar_url?: string | null } | null)?.avatar_url ?? null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Admin · 审核队列
        </p>
        <h1 className="mt-1 text-2xl font-semibold -tracking-[0.01em] text-ink">
          用户提议的题
        </h1>

        <div className="mt-4 flex gap-1.5">
          {TABS.map((tab) => {
            const active = tab.value === status;
            return (
              <Link
                key={tab.value}
                href={`/admin/suggestions?status=${tab.value}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active ? "bg-ink text-cream" : "bg-cream-2 text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <AdminSuggestionRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-card p-10 text-center text-sm text-ink-soft ring-1 ring-border/50">
          {status === "pending"
            ? "队列空了 · 没有待审的题。"
            : status === "approved"
            ? "还没批准过题。"
            : "还没驳回过题。"}
        </div>
      )}
    </main>
  );
}

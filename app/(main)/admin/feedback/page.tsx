import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminFeedbackRow } from "@/components/admin-feedback-row";

type Status = "open" | "resolved";

const TABS: { value: Status; label: string }[] = [
  { value: "open",     label: "待处理" },
  { value: "resolved", label: "已回复" },
];

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: Status }>;
}) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  const { status: rawStatus } = await searchParams;
  const status: Status = TABS.some((t) => t.value === rawStatus)
    ? (rawStatus as Status)
    : "open";

  const { data: rawRows } = await ctx.supabase
    .from("feedback")
    .select(`
      id, user_id, content, status, admin_reply, resolved_at, created_at
    `)
    .eq("status", status)
    .order("created_at", { ascending: status === "open" });

  const userIds = Array.from(new Set((rawRows ?? []).map((r) => r.user_id)));
  const { data: profileRows } = userIds.length
    ? await ctx.supabase
        .from("public_profiles")
        .select("id, nickname, avatar_url")
        .in("id", userIds)
    : { data: [] };
  const profileMap = new Map(
    (profileRows ?? []).map((p) => [p.id, p])
  );

  const items = (rawRows ?? []).map((r) => ({
    id: r.id,
    content: r.content,
    status: r.status as Status,
    adminReply: r.admin_reply,
    resolvedAt: r.resolved_at,
    createdAt: r.created_at,
    senderNickname: profileMap.get(r.user_id)?.nickname ?? "?",
    senderAvatar: profileMap.get(r.user_id)?.avatar_url ?? null,
  }));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-5 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Admin · 用户反馈
        </p>
        <h1 className="mt-1 text-2xl font-semibold -tracking-[0.01em] text-ink">
          意见箱
        </h1>

        <div className="mt-4 flex gap-1.5">
          {TABS.map((tab) => {
            const active = tab.value === status;
            return (
              <Link
                key={tab.value}
                href={`/admin/feedback?status=${tab.value}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-ink text-cream"
                    : "bg-cream-2 text-ink-soft hover:text-ink"
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
            <AdminFeedbackRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-card p-10 text-center text-sm text-ink-soft ring-1 ring-border/50">
          {status === "open" ? "队列空了 · 没有待处理反馈。" : "还没回复过任何反馈。"}
        </div>
      )}
    </main>
  );
}

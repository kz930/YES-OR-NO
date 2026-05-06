import { createClient } from "@/lib/supabase/server";
import { FeedbackForm } from "@/components/feedback-form";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("feedback")
    .select("id, content, status, admin_reply, resolved_at, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-5 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Feedback · 意见反馈
        </p>
        <h1 className="mt-1 text-3xl font-semibold -tracking-[0.01em] text-ink">
          告诉我们想说的
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          bug、建议、想要的新功能,都可以写。每条都会有人看,管理员看到后会在下方回复你。
        </p>
      </div>

      <div className="rounded-3xl bg-card p-6 ring-1 ring-border/50 sm:p-8">
        <FeedbackForm />
      </div>

      {rows && rows.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink">
            我提过的反馈 · {rows.length}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl bg-card p-5 ring-1 ring-border/50"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      r.status === "resolved"
                        ? "bg-forest text-white"
                        : "bg-sunflower text-ink"
                    }`}
                  >
                    {r.status === "resolved" ? "已回复" : "等待回复"}
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    {new Date(r.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink whitespace-pre-wrap break-words">
                  {r.content}
                </p>
                {r.admin_reply && (
                  <div className="mt-3 rounded-xl bg-cream-2 p-4">
                    <p className="text-[11px] font-semibold text-forest">
                      管理员回复
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink whitespace-pre-wrap break-words">
                      {r.admin_reply}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

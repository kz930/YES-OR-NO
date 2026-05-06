"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Item {
  id: string;
  title: string;
  description: string | null;
  sideALabel: string;
  sideBLabel: string;
  source: string | null;
  status: "pending" | "approved" | "rejected";
  reviewerNote: string | null;
  approvedQuestionId: number | null;
  isAnonymous: boolean;
  createdAt: string;
  categoryName: string | null;
  proposerNickname: string;
  proposerAvatar: string | null;
}

const REJECT_TEMPLATES = [
  "含政治 / 现实争议",
  "题面不清晰",
  "重复题目",
  "立场不对等(YES / NO 不平衡)",
];

export function AdminSuggestionRow({ item }: { item: Item }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  async function approve() {
    if (pending) return;
    if (!confirm(`通过这道题?将立刻发布到题库:\n\n${item.title}`)) return;

    startTransition(async () => {
      const res = await fetch(
        `/api/admin/suggestions/${item.id}/approve`,
        { method: "POST" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "通过失败");
        return;
      }
      toast.success("已通过,题目已发布");
      router.refresh();
    });
  }

  async function reject() {
    if (reason.trim().length < 5) {
      toast.error("理由至少 5 字");
      return;
    }
    setRejecting(true);
    const res = await fetch(`/api/admin/suggestions/${item.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewer_note: reason.trim() }),
    });
    setRejecting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "驳回失败");
      return;
    }
    toast.success("已驳回");
    setRejectOpen(false);
    router.refresh();
  }

  return (
    <li className="rounded-2xl bg-card p-5 ring-1 ring-border/50">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          {item.proposerAvatar && (
            <AvatarImage src={item.proposerAvatar} alt={item.proposerNickname} />
          )}
          <AvatarFallback className="bg-jade text-sm font-bold text-white">
            {item.proposerNickname.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-soft">
            <span className="font-semibold text-ink">{item.proposerNickname}</span>
            {item.isAnonymous && (
              <span className="rounded-full bg-cream-2 px-1.5 py-px text-[9px] font-bold text-ink-soft">
                匿名提议
              </span>
            )}
            <span>·</span>
            <span>{item.categoryName ?? "—"}</span>
            <span>·</span>
            <span>{new Date(item.createdAt).toLocaleString("zh-CN")}</span>
          </div>

          <h3 className="mt-2 text-base font-semibold leading-snug text-ink">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {item.description}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-forest/15 px-2.5 py-0.5 text-[10px] font-bold text-forest">
              YES · {item.sideALabel}
            </span>
            <span className="rounded-full bg-blossom/40 px-2.5 py-0.5 text-[10px] font-bold text-mulberry">
              NO · {item.sideBLabel}
            </span>
          </div>

          {item.source && (
            <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-soft">
              · {item.source}
            </p>
          )}

          {item.status === "pending" && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={approve}
                disabled={pending}
                className="bg-forest text-white hover:bg-forest-2"
              >
                {pending ? "处理中…" : "通过"}
              </Button>

              <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" disabled={pending}>
                      驳回
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>驳回理由</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-ink-soft">
                    会显示给提议人,请简短说明原因(5-100 字)。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {REJECT_TEMPLATES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setReason(t)}
                        className="rounded-full bg-cream-2 px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:bg-cream-2/70"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="或者自己写……"
                    rows={3}
                    maxLength={100}
                    className="mt-3 resize-none"
                  />
                  <p className="mt-1 text-right text-[11px] text-ink-soft">
                    {reason.length}/100
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setRejectOpen(false)}
                      disabled={rejecting}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={reject}
                      disabled={rejecting || reason.trim().length < 5}
                      className="bg-blossom-2 text-white hover:bg-mulberry"
                    >
                      {rejecting ? "驳回中…" : "确认驳回"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {item.status === "approved" && item.approvedQuestionId && (
            <Link
              href={`/q/${item.approvedQuestionId}/debate`}
              className="mt-3 inline-block text-xs font-semibold text-forest hover:underline"
            >
              已发布 → 看大家怎么投
            </Link>
          )}

          {item.status === "rejected" && item.reviewerNote && (
            <p className="mt-3 rounded-lg bg-blossom/30 px-3 py-2 text-xs text-mulberry">
              驳回理由:{item.reviewerNote}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

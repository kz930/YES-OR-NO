"use client";

import Link from "next/link";
import { useState } from "react";
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
  content: string;
  status: "open" | "resolved";
  adminReply: string | null;
  resolvedAt: string | null;
  createdAt: string;
  senderNickname: string;
  senderAvatar: string | null;
}

export function AdminFeedbackRow({ item }: { item: Item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (reply.trim().length < 1) {
      toast.error("回复不能为空");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/admin/feedback/${item.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_reply: reply.trim() }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "回复失败");
      return;
    }
    toast.success("已回复");
    setOpen(false);
    router.refresh();
  }

  return (
    <li className="rounded-2xl bg-card p-5 ring-1 ring-border/50">
      <div className="flex items-start gap-3">
        <Link
          href={`/u/${encodeURIComponent(item.senderNickname)}`}
          className="shrink-0"
        >
          <Avatar className="h-9 w-9">
            {item.senderAvatar && (
              <AvatarImage src={item.senderAvatar} alt={item.senderNickname} />
            )}
            <AvatarFallback className="bg-jade text-sm font-bold text-white">
              {item.senderNickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-1.5 text-[11px] text-ink-soft">
            <Link
              href={`/u/${encodeURIComponent(item.senderNickname)}`}
              className="text-sm font-semibold text-ink hover:underline"
            >
              {item.senderNickname}
            </Link>
            <span>·</span>
            <span>{new Date(item.createdAt).toLocaleString("zh-CN")}</span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink whitespace-pre-wrap break-words">
            {item.content}
          </p>

          {item.status === "resolved" && item.adminReply && (
            <div className="mt-3 rounded-xl bg-cream-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest">
                管理员回复
                {item.resolvedAt && (
                  <span className="ml-1.5 font-normal text-ink-soft">
                    · {new Date(item.resolvedAt).toLocaleDateString("zh-CN")}
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-sm text-ink whitespace-pre-wrap break-words">
                {item.adminReply}
              </p>
            </div>
          )}

          {item.status === "open" && (
            <div className="mt-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button className="bg-forest text-white hover:bg-forest-2">
                      回复并标记完成
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>回复反馈</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-ink-soft">
                    回复内容会显示给提交者。
                  </p>
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="谢谢反馈,这个建议……"
                    rows={5}
                    maxLength={1000}
                    className="mt-3 resize-none"
                    autoFocus
                  />
                  <p className="mt-1 text-right text-[11px] text-ink-soft">
                    {reply.length}/1000
                  </p>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={submitting}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={submit}
                      disabled={submitting || reply.trim().length < 1}
                      className="bg-forest text-white hover:bg-forest-2"
                    >
                      {submitting ? "发送中…" : "发送回复"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

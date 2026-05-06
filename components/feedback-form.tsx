"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const MAX = 1000;

export function FeedbackForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 5) {
      toast.error("至少 5 个字");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "提交失败");
      return;
    }
    toast.success("已收到,谢谢");
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="例如:辩论页评论框可以加个表情吗 / 找不到我提的题在哪 / 某个题描述不清楚……"
        rows={5}
        maxLength={MAX}
        disabled={submitting}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink-soft">
          {content.length}/{MAX}
        </span>
        <button
          type="submit"
          disabled={submitting || content.trim().length < 5}
          className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-2 disabled:bg-cream-2 disabled:text-ink-soft"
        >
          {submitting ? "提交中…" : "发送"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Heart } from "@/components/icons/heart";

export function QuestionLikeButton({
  questionId,
  initialLiked,
  initialCount,
}: {
  questionId: number;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    const res = await fetch(`/api/questions/${questionId}/like`, {
      method: next ? "POST" : "DELETE",
    });
    if (!res.ok) {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
      toast.error("点赞失败,稍后再试");
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft transition-all hover:bg-cream-2 hover:scale-105 active:scale-95"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          liked ? "fill-blossom-2 text-blossom-2" : "text-ink-soft"
        }`}
      />
      <span>{count}</span>
    </button>
  );
}

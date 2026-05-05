"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Side } from "@/types/db";

interface Props {
  questionId: number;
  sideALabel: string;
  sideBLabel: string;
  prefilledSide: Side | null;
}

export function VoteButtons({
  questionId,
  sideALabel,
  sideBLabel,
  prefilledSide,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<Side | null>(null);
  const autoVoted = useRef(false);

  async function vote(side: Side) {
    setSubmitting(side);

    const res = await fetch(`/api/questions/${questionId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "投票失败,稍后再试");
      setSubmitting(null);
      return;
    }

    router.push(`/q/${questionId}/debate`);
    router.refresh();
  }

  useEffect(() => {
    if (prefilledSide && !autoVoted.current) {
      autoVoted.current = true;
      vote(prefilledSide);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledSide]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => vote("a")}
        disabled={submitting !== null}
        className="group flex h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-forest text-white transition-all hover:bg-forest-2 active:scale-[0.97] disabled:opacity-70"
      >
        <span className="font-display text-2xl italic font-medium">
          {submitting === "a" ? "..." : "YES"}
        </span>
        <span className="text-sm font-semibold tracking-wide">
          {sideALabel}
        </span>
      </button>
      <button
        onClick={() => vote("b")}
        disabled={submitting !== null}
        className="group flex h-20 flex-col items-center justify-center gap-1 rounded-2xl bg-blossom text-mulberry transition-all hover:bg-blossom-2 hover:text-white active:scale-[0.97] disabled:opacity-70"
      >
        <span className="font-display text-2xl italic font-medium">
          {submitting === "b" ? "..." : "NO"}
        </span>
        <span className="text-sm font-semibold tracking-wide">
          {sideBLabel}
        </span>
      </button>
    </div>
  );
}

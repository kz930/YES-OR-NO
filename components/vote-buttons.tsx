"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const [submitting, setSubmitting] = useState<Side | null>(prefilledSide);

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

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        size="lg"
        onClick={() => vote("a")}
        disabled={submitting !== null}
        className="h-16 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 transition-transform active:scale-95"
      >
        {submitting === "a" ? "提交中..." : sideALabel}
      </Button>
      <Button
        size="lg"
        variant="destructive"
        onClick={() => vote("b")}
        disabled={submitting !== null}
        className="h-16 text-lg font-bold transition-transform active:scale-95"
      >
        {submitting === "b" ? "提交中..." : sideBLabel}
      </Button>
    </div>
  );
}

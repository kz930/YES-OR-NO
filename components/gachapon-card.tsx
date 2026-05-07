"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart } from "@/components/icons/heart";
import type { Side } from "@/types/db";

interface Props {
  question: {
    id: number;
    title: string;
    source: string | null;
    source_detail: string | null;
    side_a_label: string;
    side_b_label: string;
    likes_count: number;
    votes_count: number;
    yes_votes_count: number;
    no_votes_count: number;
  };
  liked: boolean;
}

export function GachaponCard({ question, liked: initialLiked }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(question.likes_count);
  const [pending, startTransition] = useTransition();

  // Vote state — start unvoted (home filters out questions the user
  // has already voted on, so this is the common case).
  const [voted, setVoted] = useState<Side | null>(null);
  const [submitting, setSubmitting] = useState<Side | null>(null);
  const [yesCount, setYesCount] = useState(question.yes_votes_count);
  const [noCount, setNoCount] = useState(question.no_votes_count);

  async function vote(side: Side) {
    if (voted || submitting) return;
    setSubmitting(side);
    const res = await fetch(`/api/questions/${question.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side }),
    });
    setSubmitting(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "投票失败");
      return;
    }
    setVoted(side);
    if (side === "a") setYesCount((c) => c + 1);
    else setNoCount((c) => c + 1);
  }

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    const res = await fetch(`/api/questions/${question.id}/like`, {
      method: next ? "POST" : "DELETE",
    });
    if (!res.ok) {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
      toast.error("点赞失败,稍后再试");
    }
  }

  function nextQuestion() {
    startTransition(() => {
      router.refresh();
    });
  }

  const total = yesCount + noCount;
  const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 50;
  const noPct = total > 0 ? 100 - yesPct : 50;
  const myLabel =
    voted === "a"
      ? question.side_a_label
      : voted === "b"
        ? question.side_b_label
        : null;

  return (
    <article className="rounded-3xl bg-card p-8 shadow-[0_2px_24px_-8px_rgba(31,42,36,0.06)] ring-1 ring-border/50 sm:p-10">
      <h2 className="text-[28px] font-semibold leading-[1.25] -tracking-[0.01em] text-ink sm:text-[32px]">
        {question.title}
      </h2>
      {question.source && (
        <p className="mt-4 text-xs uppercase tracking-wider text-ink-soft">
          · {question.source}
          {question.source_detail ? ` · ${question.source_detail}` : ""}
        </p>
      )}

      {voted ? (
        // Post-vote state: bar + stance pill + 评论区 / 下一题
        <>
          <div className="mt-9">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-cream-2">
              <div
                className="h-full bg-forest transition-all"
                style={{ width: `${yesPct}%` }}
              />
              <div
                className="h-full bg-blossom transition-all"
                style={{ width: `${noPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-semibold">
              <span className="text-forest">YES {yesPct}% · {yesCount} 票</span>
              <span className="text-mulberry">{noCount} 票 · {noPct}% NO</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-ink-soft">
            你投了{" "}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-semibold ${
                voted === "a"
                  ? "bg-forest text-white"
                  : "bg-blossom text-mulberry"
              }`}
            >
              <span className="font-bold tracking-tight">
                {voted === "a" ? "YES" : "NO"}
              </span>
              <span>{myLabel}</span>
            </span>
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href={`/q/${question.id}/debate`}
              className="flex h-12 items-center justify-center rounded-2xl bg-cream-2 text-sm font-semibold text-ink transition-colors hover:bg-jade/30"
            >
              💬 进入评论区
            </Link>
            <button
              onClick={nextQuestion}
              disabled={pending}
              className="flex h-12 items-center justify-center rounded-2xl bg-forest text-sm font-semibold text-white transition-colors hover:bg-forest-2 disabled:opacity-60"
            >
              {pending ? "切换中…" : "→ 下一题"}
            </button>
          </div>
        </>
      ) : (
        // Pre-vote state: YES / NO buttons
        <div className="mt-9 grid grid-cols-2 gap-3">
          <button
            onClick={() => vote("a")}
            disabled={submitting !== null}
            className="flex h-16 flex-col items-center justify-center rounded-2xl bg-forest text-white transition-all hover:bg-forest-2 active:scale-[0.97] disabled:opacity-70"
          >
            <span className="text-base font-bold tracking-tight">
              {submitting === "a" ? "..." : "YES"}
            </span>
            <span className="text-[11px] font-medium opacity-90">
              {question.side_a_label}
            </span>
          </button>
          <button
            onClick={() => vote("b")}
            disabled={submitting !== null}
            className="flex h-16 flex-col items-center justify-center rounded-2xl bg-blossom text-mulberry transition-all hover:bg-blossom-2 hover:text-white active:scale-[0.97] disabled:opacity-70"
          >
            <span className="text-base font-bold tracking-tight">
              {submitting === "b" ? "..." : "NO"}
            </span>
            <span className="text-[11px] font-medium opacity-90">
              {question.side_b_label}
            </span>
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft transition-all hover:bg-cream-2 hover:scale-105 active:scale-95"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "fill-blossom-2 text-blossom-2" : "text-ink-soft"
            }`}
          />
          <span>{count}</span>
        </button>
        {!voted && (
          <button
            onClick={nextQuestion}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-full bg-cream-2 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-all hover:bg-jade/30 active:scale-95 disabled:opacity-60"
          >
            <span>↻</span>
            <span>{pending ? "换中…" : "换一题"}</span>
          </button>
        )}
      </div>
    </article>
  );
}

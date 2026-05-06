"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart } from "@/components/icons/heart";

interface Props {
  question: {
    id: number;
    title: string;
    source: string | null;
    source_detail: string | null;
    side_a_label: string;
    side_b_label: string;
    likes_count: number;
  };
  liked: boolean;
}

export function GachaponCard({ question, liked: initialLiked }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(question.likes_count);
  const [pending, startTransition] = useTransition();

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

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="relative">
      {/* Decorative gachapon-machine illustration. The card itself is the
          glass dome — sparkles & dots evoke a capsule machine. */}
      <div className="pointer-events-none absolute -top-3 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-sunflower shadow-md ring-4 ring-cream">
        <span className="text-xl">✨</span>
      </div>

      <article className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-blossom/40 via-card to-sky/30 p-8 shadow-[0_2px_24px_-8px_rgba(31,42,36,0.12)] ring-1 ring-border/40 sm:p-10">
        {/* Floating decorative capsules */}
        <Bubble className="left-4 top-6 h-8 w-8 bg-sunflower" />
        <Bubble className="right-6 top-12 h-6 w-6 bg-jade" />
        <Bubble className="bottom-32 right-10 h-5 w-5 bg-lavender" />
        <Bubble className="bottom-40 left-8 h-7 w-7 bg-peach" />

        <div className="relative">
          <h2 className="text-[28px] font-semibold leading-[1.25] -tracking-[0.01em] text-ink sm:text-[32px]">
            {question.title}
          </h2>
          {question.source && (
            <p className="mt-4 text-xs uppercase tracking-wider text-ink-soft">
              · {question.source}
              {question.source_detail ? ` · ${question.source_detail}` : ""}
            </p>
          )}

          <div className="mt-9 grid grid-cols-2 gap-3">
            <Link
              href={`/q/${question.id}?side=a`}
              className="flex h-16 flex-col items-center justify-center rounded-2xl bg-forest text-white transition-all hover:bg-forest-2 active:scale-[0.97]"
            >
              <span className="text-base font-bold tracking-tight">YES</span>
              <span className="text-[11px] font-medium opacity-90">
                {question.side_a_label}
              </span>
            </Link>
            <Link
              href={`/q/${question.id}?side=b`}
              className="flex h-16 flex-col items-center justify-center rounded-2xl bg-blossom text-mulberry transition-all hover:bg-blossom-2 hover:text-white active:scale-[0.97]"
            >
              <span className="text-base font-bold tracking-tight">NO</span>
              <span className="text-[11px] font-medium opacity-90">
                {question.side_b_label}
              </span>
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur transition-all hover:scale-105 active:scale-95"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  liked ? "fill-blossom-2 text-blossom-2" : "text-ink-soft"
                }`}
              />
              <span>{count}</span>
            </button>
            <button
              onClick={refresh}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              <span className="text-sm">🎰</span>
              <span>{pending ? "扭蛋中…" : "换一题"}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Bubble({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute rounded-full opacity-60 mix-blend-multiply ${className}`}
    />
  );
}

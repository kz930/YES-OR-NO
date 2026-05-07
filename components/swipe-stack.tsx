"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { toast } from "sonner";
import { Heart } from "@/components/icons/heart";
import type { Side } from "@/types/db";

interface Card {
  id: number;
  title: string;
  source: string | null;
  sourceDetail: string | null;
  sideALabel: string;
  sideBLabel: string;
  likesCount: number;
  votesCount: number;
  argumentsCount: number;
  categoryName: string | null;
  categorySlug: string | null;
  initiallyLiked: boolean;
}

const SWIPE_THRESHOLD = 110;

type Action = "yes" | "no" | "skip";

export function SwipeStack({ cards: initial }: { cards: Card[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initial);

  if (cards.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-10 text-center ring-1 ring-border/50">
        <p className="text-2xl">🥹</p>
        <p className="mt-3 text-sm font-semibold text-ink">
          暂时没有新题了
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          投过的题不会再出现。等等大家提的新题被收录,或者
          <button
            onClick={() => router.push("/suggest")}
            className="ml-1 font-semibold text-forest hover:underline"
          >
            自己提一题
          </button>
        </p>
      </div>
    );
  }

  function pop(action: Action, id: number) {
    if (action === "yes" || action === "no") {
      // Optimistic vote — fire and forget; surface failures via toast.
      const side: Side = action === "yes" ? "a" : "b";
      fetch(`/api/questions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            toast.error(body.error ?? `投票失败 (${res.status})`);
          }
        })
        .catch((err) => {
          toast.error(`网络错误:${err?.message ?? "未知"}`);
        });
    }
    setCards((curr) => curr.filter((c) => c.id !== id));
  }

  function tap(id: number) {
    router.push(`/q/${id}`);
  }

  // Render top 3 cards stacked, with the topmost interactive
  const visible = cards.slice(0, 3);

  return (
    <>
      <div className="relative h-[520px] w-full">
        <AnimatePresence>
          {visible.map((card, i) => (
            <SwipeCard
              key={card.id}
              card={card}
              depth={i}
              isTop={i === 0}
              onSwipe={pop}
              onTap={tap}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Tap shortcuts under the deck: YES · SKIP · NO */}
      <div className="flex items-center justify-center gap-5">
        <button
          aria-label="YES"
          onClick={() => visible[0] && pop("yes", visible[0].id)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-white text-xs font-bold tracking-tight shadow-sm transition-transform hover:scale-110 active:scale-95"
        >
          YES
        </button>
        <button
          aria-label="跳过"
          onClick={() => visible[0] && pop("skip", visible[0].id)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-2 text-lg text-ink-soft transition-transform hover:scale-110 active:scale-95"
        >
          ✕
        </button>
        <button
          aria-label="NO"
          onClick={() => visible[0] && pop("no", visible[0].id)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blossom text-mulberry text-xs font-bold tracking-tight shadow-sm transition-transform hover:scale-110 active:scale-95"
        >
          NO
        </button>
      </div>
    </>
  );
}

function SwipeCard({
  card,
  depth,
  isTop,
  onSwipe,
  onTap,
}: {
  card: Card;
  depth: number;
  isTop: boolean;
  onSwipe: (action: Action, id: number) => void;
  onTap: (id: number) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14]);
  // Left swipe = YES, right swipe = NO
  const yesOpacity = useTransform(x, [-140, -40], [1, 0]);
  const noOpacity = useTransform(x, [40, 140], [0, 1]);

  const baseScale = depth === 0 ? 1 : depth === 1 ? 0.96 : 0.92;
  const baseY = depth * 10;

  function onDragEnd(_e: unknown, info: PanInfo) {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -SWIPE_THRESHOLD || velocity < -600) {
      // Left swipe → YES vote
      onSwipe("yes", card.id);
    } else if (offset > SWIPE_THRESHOLD || velocity > 600) {
      // Right swipe → NO vote
      onSwipe("no", card.id);
    } else {
      x.set(0);
    }
  }

  const tappable = useMemo(() => {
    let dragged = false;
    return {
      onPointerDown: () => {
        dragged = false;
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 4) dragged = true;
      },
      onClick: () => {
        if (!dragged) onTap(card.id);
      },
    };
  }, [card.id, onTap]);

  const isAnswerable =
    card.sideALabel.length > 0 && card.sideBLabel.length > 0;

  return (
    <motion.article
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: baseScale,
        y: baseY,
        zIndex: 100 - depth,
      }}
      initial={{ scale: baseScale, y: baseY, opacity: 0 }}
      animate={{ scale: baseScale, y: baseY, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 600 : x.get() < 0 ? -600 : 0,
        opacity: 0,
        rotate: x.get() > 0 ? 30 : x.get() < 0 ? -30 : 0,
        transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
      }}
      className={`absolute inset-0 select-none overflow-hidden rounded-[28px] bg-card p-7 shadow-[0_4px_24px_-8px_rgba(31,42,36,0.18)] ring-1 ring-border/40 ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      {...(isTop ? tappable : {})}
    >
      {/* Decorative gradient overlay (opaque card behind, this just tints) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blossom/45 via-transparent to-sky/45"
      />
      {/* Floating label overlays */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: yesOpacity }}
            className="pointer-events-none absolute left-6 top-6 rotate-[-12deg] rounded-2xl border-4 border-forest px-4 py-1.5"
          >
            <span className="text-2xl font-extrabold tracking-widest text-forest">
              YES
            </span>
          </motion.div>
          <motion.div
            style={{ opacity: noOpacity }}
            className="pointer-events-none absolute right-6 top-6 rotate-[12deg] rounded-2xl border-4 border-blossom-2 px-4 py-1.5"
          >
            <span className="text-2xl font-extrabold tracking-widest text-blossom-2">
              NO
            </span>
          </motion.div>
        </>
      )}

      <div className="relative flex h-full flex-col">
        {card.categoryName && (
          <span className="self-start rounded-full bg-card/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft backdrop-blur">
            {card.categoryName}
          </span>
        )}

        <h2 className="mt-5 text-2xl font-semibold leading-[1.25] -tracking-[0.01em] text-ink sm:text-[26px]">
          {card.title}
        </h2>

        {card.source && (
          <p className="mt-3 text-[11px] uppercase tracking-wider text-ink-soft">
            · {card.source}
            {card.sourceDetail ? ` · ${card.sourceDetail}` : ""}
          </p>
        )}

        <div className="flex-1" />

        {isAnswerable && (
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-forest/90 px-3 py-2">
              <p className="text-xs font-bold tracking-tight text-white">YES</p>
              <p className="text-[11px] font-medium text-white/85">
                {card.sideALabel}
              </p>
            </div>
            <div className="rounded-xl bg-blossom px-3 py-2">
              <p className="text-xs font-bold tracking-tight text-mulberry">NO</p>
              <p className="text-[11px] font-medium text-mulberry/80">
                {card.sideBLabel}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-[11px] font-medium text-ink-soft">
          <span className="flex items-center gap-1">
            <span>🗳</span>
            <span className="font-bold text-ink">{card.votesCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span className="font-bold text-ink">{card.likesCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>💬</span>
            <span className="font-bold text-ink">{card.argumentsCount}</span>
          </span>
          {isTop && (
            <span className="ml-auto text-[10px] uppercase tracking-wider">
              点开看详情
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

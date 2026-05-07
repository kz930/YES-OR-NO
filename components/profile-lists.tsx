"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "@/components/icons/heart";
import { paletteFor } from "@/lib/category-palette";
import type { Side } from "@/types/db";

export interface FavRow {
  id: number;
  title: string;
  source: string | null;
  source_detail: string | null;
  categorySlug: string | null;
  categoryName: string | null;
}

export interface AnsweredRow {
  id: number;
  title: string;
  side: Side;
  sideALabel: string;
  sideBLabel: string;
  categorySlug: string | null;
  categoryName: string | null;
}

interface Props {
  favorites: FavRow[];
  answered: AnsweredRow[];
}

export function ProfileLists({ favorites, answered }: Props) {
  return (
    <>
      <CollapsibleSection
        icon={<Heart className="h-4 w-4 fill-blossom-2 text-blossom-2" />}
        title="我喜欢的题"
        count={favorites.length}
        emptyHint={
          <>
            还没喜欢过题。在
            <Link href="/swipe" className="mx-1 font-semibold text-forest hover:underline">
              随便逛
            </Link>
            或讨论页点心形,题就会收到这里。
          </>
        }
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {favorites.map((f) => {
            const palette = paletteFor(f.categorySlug);
            return (
              <li key={f.id}>
                <Link
                  href={`/q/${f.id}/debate`}
                  className="group flex h-full flex-col justify-between rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: palette.bg }}
                >
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: palette.accent }}
                    >
                      {palette.emoji} {f.categoryName ?? ""}
                    </span>
                    <h4 className="mt-2 text-sm font-semibold leading-snug text-ink line-clamp-3">
                      {f.title}
                    </h4>
                  </div>
                  {f.source && (
                    <p className="mt-3 text-[10px] uppercase tracking-wider text-ink-soft">
                      · {f.source}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection
        icon={<span className="text-base">🗳</span>}
        title="我回答过的题"
        count={answered.length}
        emptyHint="还没投过票。回主页或浏览一下,挑一道你想聊的。"
      >
        <ul className="flex flex-col gap-2">
          {answered.map((a) => (
            <li key={a.id}>
              <Link
                href={`/q/${a.id}/debate`}
                className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/50 transition-all hover:ring-forest/40"
              >
                <h4 className="text-sm font-semibold leading-snug text-ink line-clamp-2">
                  {a.title}
                </h4>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                    a.side === "a"
                      ? "bg-forest/15 text-forest"
                      : "bg-blossom/40 text-mulberry"
                  }`}
                >
                  {a.side === "a" ? "YES" : "NO"} ·{" "}
                  {a.side === "a" ? a.sideALabel : a.sideBLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </>
  );
}

function CollapsibleSection({
  icon,
  title,
  count,
  children,
  emptyHint,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
  emptyHint: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl bg-card ring-1 ring-border/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
        aria-expanded={open}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {icon}
          {title}
          <span className="text-xs font-normal text-ink-soft">· {count}</span>
        </h3>
        <span
          className={`text-base text-ink-soft transition-transform ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          →
        </span>
      </button>

      {open && (
        <div className="border-t border-border/50 p-5">
          {count > 0 ? (
            children
          ) : (
            <p className="text-sm text-ink-soft">{emptyHint}</p>
          )}
        </div>
      )}
    </section>
  );
}

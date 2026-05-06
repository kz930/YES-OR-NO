"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart } from "@/components/icons/heart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import type { Side } from "@/types/db";

interface CommentRow {
  id: string;
  content: string;
  side: Side;
  likes_count: number;
  created_at: string;
  nickname: string;
  avatar_url: string | null;
  is_anonymous: boolean;
  initiallyLiked: boolean;
}

interface Props {
  questionId: number;
  mySide: Side;
  myLabel: string;
  sideALabel: string;
  sideBLabel: string;
  initialArguments: CommentRow[];
  sortMode: "likes" | "time";
}

export function CommentThread({
  questionId,
  mySide,
  myLabel,
  initialArguments,
  sortMode,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    if (draft.length > 200) {
      toast.error("评论最多 200 字");
      return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/questions/${questionId}/arguments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft.trim(), is_anonymous: isAnonymous }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "发送失败,稍后再试");
      return;
    }

    setDraft("");
    setIsAnonymous(false);
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">
          讨论 · {initialArguments.length}
        </h2>
        <div className="flex gap-1.5 text-[11px]">
          <SortLink active={sortMode === "likes"} sort="likes" label="按点赞" />
          <SortLink active={sortMode === "time"} sort="time" label="按时间" />
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl bg-card p-4 ring-1 ring-border/50"
      >
        <p className="text-[11px] text-ink-soft">
          {isAnonymous ? (
            <>
              以{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-2 px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                匿名
              </span>{" "}
              发表(YES/NO 立场仍会显示)
            </>
          ) : (
            <>
              以{" "}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  mySide === "a" ? "bg-forest text-white" : "bg-blossom text-mulberry"
                }`}
              >
                {mySide === "a" ? "YES" : "NO"} · {myLabel}
              </span>{" "}
              的身份发表
            </>
          )}
        </p>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="说说你的看法……"
          rows={2}
          maxLength={200}
          className="mt-2 resize-none border-none bg-transparent p-0 focus-visible:ring-0"
          disabled={submitting}
        />
        <div className="mt-2 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink-soft">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={submitting}
              className="h-3.5 w-3.5 accent-forest"
            />
            匿名发表
          </label>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-ink-soft">
              {draft.length}/200
            </span>
            <button
              type="submit"
              disabled={!draft.trim() || submitting}
              className="rounded-full bg-forest px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-2 disabled:bg-cream-2 disabled:text-ink-soft"
            >
              {submitting ? "发送中…" : "发送"}
            </button>
          </div>
        </div>
      </form>

      {initialArguments.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center text-sm text-ink-soft ring-1 ring-border/50">
          还没人说话,你来开个头?
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {initialArguments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SortLink({
  active,
  sort,
  label,
}: {
  active: boolean;
  sort: "likes" | "time";
  label: string;
}) {
  return (
    <a
      href={`?sort=${sort}`}
      className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
        active ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </a>
  );
}

function CommentItem({ comment }: { comment: CommentRow }) {
  const [liked, setLiked] = useState(comment.initiallyLiked);
  const [count, setCount] = useState(comment.likes_count);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    const res = await fetch(`/api/arguments/${comment.id}/like`, {
      method: next ? "POST" : "DELETE",
    });
    if (!res.ok) {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
      toast.error("点赞失败");
    }
  }

  const displayName = comment.is_anonymous ? "匿名" : comment.nickname;
  const showAvatar = !comment.is_anonymous && comment.avatar_url;
  const profileHref = comment.is_anonymous
    ? null
    : `/u/${encodeURIComponent(comment.nickname)}`;

  const Avi = (
    <Avatar className="h-9 w-9 shrink-0">
      {showAvatar && (
        <AvatarImage src={comment.avatar_url!} alt={displayName} />
      )}
      <AvatarFallback
        className={`text-sm font-bold ${
          comment.is_anonymous
            ? "bg-cream-2 text-ink-soft"
            : "bg-jade text-white"
        }`}
      >
        {comment.is_anonymous ? "匿" : displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  const Name = (
    <span
      className={`text-sm font-semibold ${
        comment.is_anonymous
          ? "text-ink-soft italic"
          : "text-ink hover:underline"
      }`}
    >
      {displayName}
    </span>
  );

  return (
    <li className="rounded-2xl bg-card p-4 ring-1 ring-border/50">
      <div className="flex items-start gap-3">
        {profileHref ? (
          <Link href={profileHref} className="shrink-0">{Avi}</Link>
        ) : (
          Avi
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {profileHref ? (
              <Link href={profileHref}>{Name}</Link>
            ) : (
              Name
            )}
            <span
              className={`shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold tracking-wider ${
                comment.side === "a"
                  ? "bg-forest text-white"
                  : "bg-blossom text-mulberry"
              }`}
            >
              {comment.side === "a" ? "YES" : "NO"}
            </span>
            <span className="ml-auto text-[10px] text-ink-soft">
              {relativeTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <button
            onClick={toggleLike}
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-ink-soft transition-transform active:scale-95"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                liked ? "fill-blossom-2 text-blossom-2" : ""
              }`}
            />
            <span>{count}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

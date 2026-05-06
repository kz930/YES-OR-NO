"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: number;
  slug: string;
  name: string;
}

const TITLE_MIN = 10;
const TITLE_MAX = 200;

export function SuggestForm({
  categories,
  remaining,
}: {
  categories: Category[];
  remaining: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(
    categories[0]?.id ?? null
  );
  const [sideA, setSideA] = useState("支持");
  const [sideB, setSideB] = useState("反对");
  const [source, setSource] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const disabled = remaining === 0 || submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      toast.error(`题面需要 ${TITLE_MIN}-${TITLE_MAX} 个字`);
      return;
    }
    if (!categoryId) {
      toast.error("请选择分类");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        category_id: categoryId,
        side_a_label: sideA || "支持",
        side_b_label: sideB || "反对",
        source: source || null,
        is_anonymous: isAnonymous,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "提交失败,稍后再试");
      return;
    }

    toast.success("已提交,等待审核");
    router.push("/me/suggestions");
    router.refresh();
  }

  if (remaining === 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-ink">
          你今天已经提了 3 题,明天再来吧。
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          想看自己提议的题去 <a href="/me/suggestions" className="text-forest font-semibold hover:underline">我的提议</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">题面 <span className="text-ink-soft">({TITLE_MIN}-{TITLE_MAX} 字)</span></Label>
        <Textarea
          id="title"
          required
          minLength={TITLE_MIN}
          maxLength={TITLE_MAX}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如:如果可以一键消除所有遗憾,你愿意按吗?"
          className="resize-none"
          rows={3}
          disabled={disabled}
        />
        <p className="text-right text-xs text-ink-soft">
          {title.length}/{TITLE_MAX}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">分类</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              disabled={disabled}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                categoryId === cat.id
                  ? "bg-forest text-white"
                  : "bg-cream-2 text-ink hover:bg-cream-2/70"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">补充说明 <span className="text-ink-soft">(选填)</span></Label>
        <Textarea
          id="description"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="背景、设定细节、为什么有趣……"
          className="resize-none"
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="sideA">YES 标签</Label>
          <Input
            id="sideA"
            maxLength={6}
            value={sideA}
            onChange={(e) => setSideA(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sideB">NO 标签</Label>
          <Input
            id="sideB"
            maxLength={6}
            value={sideB}
            onChange={(e) => setSideB(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">来源 <span className="text-ink-soft">(选填)</span></Label>
        <Input
          id="source"
          maxLength={40}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="如 知乎@xxx / 自己想的 / 朋友提的"
          disabled={disabled}
        />
      </div>

      <label className="flex items-center gap-2.5 rounded-xl bg-cream-2 px-3.5 py-2.5 text-sm">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 accent-forest"
        />
        <span className="flex-1 text-ink">匿名提议</span>
        <span className="text-xs text-ink-soft">
          不显示昵称
        </span>
      </label>

      <Button
        type="submit"
        disabled={disabled}
        className="w-full h-11 bg-forest hover:bg-forest-2 text-white font-semibold"
      >
        {submitting ? "提交中..." : "提交审核"}
      </Button>
    </form>
  );
}

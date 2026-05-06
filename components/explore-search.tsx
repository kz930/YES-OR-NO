"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialQuery: string;
  categorySlug: string | null;
  sort: string;
}

export function ExploreSearch({ initialQuery, categorySlug, sort }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function go(q: string) {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(`/explore${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
      className="flex items-center gap-2 rounded-full bg-cream-2 px-4 py-2 ring-1 ring-border/50 focus-within:ring-forest/40"
    >
      <span className="text-sm text-ink-soft">🔍</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索题目……"
        className="flex-1 bg-transparent text-sm placeholder:text-ink-soft focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            go("");
          }}
          className="text-xs font-medium text-ink-soft hover:text-ink"
          aria-label="清空"
        >
          ✕
        </button>
      )}
    </form>
  );
}

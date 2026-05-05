"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Category {
  id: number;
  slug: string;
  name: string;
}

export function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <Suspense fallback={null}>
      <CategoryNavInner categories={categories} />
    </Suspense>
  );
}

function CategoryNavInner({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSlug = searchParams.get("category");

  const isAllActive = pathname === "/explore" && !currentSlug;

  return (
    <nav className="border-t border-border/40">
      <div className="mx-auto max-w-3xl">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryPill
            href="/explore"
            label="全部"
            active={isAllActive}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              href={`/explore?category=${cat.slug}`}
              label={cat.name}
              active={
                pathname === "/explore" && currentSlug === cat.slug
              }
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-ink text-cream"
          : "text-ink-soft hover:bg-cream-2 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

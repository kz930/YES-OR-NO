import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const supabase = await createClient();

  // Pick a daily question (any one with is_daily=true; fallback to most recent published)
  const { data: dailyQuestions } = await supabase
    .from("questions")
    .select("id, title, source, source_detail, side_a_label, side_b_label, category_id")
    .eq("status", "published")
    .eq("is_daily", true)
    .limit(1);

  let question = dailyQuestions?.[0];
  if (!question) {
    const { data: fallback } = await supabase
      .from("questions")
      .select("id, title, source, source_detail, side_a_label, side_b_label, category_id")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1);
    question = fallback?.[0];
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, color_hex")
    .order("display_order");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      {question ? (
        <Card className="p-8">
          <Badge variant="secondary" className="mb-4">
            今日一题
          </Badge>
          <h2 className="text-2xl font-extrabold leading-snug sm:text-3xl">
            {question.title}
          </h2>
          {question.source && (
            <p className="mt-3 text-sm text-muted-foreground">
              · {question.source}
              {question.source_detail ? ` · ${question.source_detail}` : ""}
            </p>
          )}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button
              render={<Link href={`/q/${question.id}?side=a`} />}
              className="h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-600"
            >
              {question.side_a_label}
            </Button>
            <Button
              render={<Link href={`/q/${question.id}?side=b`} />}
              variant="destructive"
              className="h-14 text-base font-bold"
            >
              {question.side_b_label}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <p>题库还是空的,先在 Supabase SQL editor 里跑一下 0003_seed_sample_questions.sql。</p>
        </Card>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">分类</h3>
        <div className="grid grid-cols-2 gap-3">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.slug}`}
              className="rounded-2xl p-4 text-center font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: cat.color_hex ?? "#58CC02" }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

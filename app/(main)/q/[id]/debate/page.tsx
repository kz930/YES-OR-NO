import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: question }, { data: vote }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, title, side_a_label, side_b_label")
      .eq("id", questionId)
      .single(),
    supabase
      .from("votes")
      .select("current_side")
      .eq("user_id", user!.id)
      .eq("question_id", questionId)
      .maybeSingle(),
  ]);

  if (!question) notFound();

  const mySide = vote?.current_side ?? null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-bold leading-snug">{question.title}</h1>
        {mySide && (
          <Badge variant="secondary" className="mt-2">
            你投了「{mySide === "a" ? question.side_a_label : question.side_b_label}」
          </Badge>
        )}
      </div>

      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          辩论页(双列论点墙)将在 Sprint 2 完成。
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          目前你已经成功投票,数据已写入 votes 表。
        </p>
        <Button render={<Link href="/" />} variant="outline" className="mt-6">
          回到首页
        </Button>
      </Card>
    </main>
  );
}

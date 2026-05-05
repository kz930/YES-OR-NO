import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VoteButtons } from "@/components/vote-buttons";

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ side?: string }>;
}) {
  const { id } = await params;
  const { side: prefilledSide } = await searchParams;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: question }, { data: existingVote }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, title, description, source, source_detail, side_a_label, side_b_label, status")
      .eq("id", questionId)
      .single(),
    supabase
      .from("votes")
      .select("current_side")
      .eq("user_id", user!.id)
      .eq("question_id", questionId)
      .maybeSingle(),
  ]);

  if (!question || question.status !== "published") notFound();
  if (existingVote) redirect(`/q/${questionId}/debate`);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-12 px-5 py-12">
      <article>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          The question
        </p>
        <h1 className="mt-3 text-[34px] font-semibold leading-[1.2] -tracking-[0.015em] text-ink sm:text-[42px]">
          {question.title}
        </h1>
        {question.description && (
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            {question.description}
          </p>
        )}
        {question.source && (
          <p className="mt-4 text-xs uppercase tracking-wider text-ink-soft">
            · {question.source}
            {question.source_detail ? ` · ${question.source_detail}` : ""}
          </p>
        )}
      </article>

      <VoteButtons
        questionId={question.id}
        sideALabel={question.side_a_label}
        sideBLabel={question.side_b_label}
        prefilledSide={prefilledSide === "a" || prefilledSide === "b" ? prefilledSide : null}
      />
    </main>
  );
}

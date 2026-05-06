import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { content?: string }
    | null;
  const content = body?.content?.trim() ?? "";
  if (content.length < 5 || content.length > 1000) {
    return NextResponse.json(
      { error: "反馈需要 5-1000 字" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    content,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

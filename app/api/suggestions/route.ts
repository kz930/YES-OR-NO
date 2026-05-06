import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Body {
  title?: string;
  description?: string | null;
  category_id?: number;
  side_a_label?: string;
  side_b_label?: string;
  source?: string | null;
  is_anonymous?: boolean;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.title || body.title.length < 10 || body.title.length > 200) {
    return NextResponse.json({ error: "题面需要 10-200 字" }, { status: 400 });
  }
  if (!body.category_id) {
    return NextResponse.json({ error: "请选择分类" }, { status: 400 });
  }
  if (body.description && body.description.length > 200) {
    return NextResponse.json({ error: "补充说明最多 200 字" }, { status: 400 });
  }

  // Rate limit: ≤ 3 pending suggestions in the last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: pendingCount } = await supabase
    .from("question_suggestions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending")
    .gte("created_at", since);

  if ((pendingCount ?? 0) >= 3) {
    return NextResponse.json(
      { error: "今天提议已达 3 题上限,明天再来" },
      { status: 429 }
    );
  }

  const { error } = await supabase.from("question_suggestions").insert({
    user_id: user.id,
    title: body.title,
    description: body.description ?? null,
    category_id: body.category_id,
    side_a_label: body.side_a_label?.trim() || "支持",
    side_b_label: body.side_b_label?.trim() || "反对",
    source: body.source ?? null,
    is_anonymous: body.is_anonymous === true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

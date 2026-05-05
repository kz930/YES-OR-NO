import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { CategoryNav } from "@/components/category-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, avatar_url, is_admin")
      .eq("id", user.id)
      .single(),
    supabase
      .from("categories")
      .select("id, slug, name")
      .order("display_order"),
  ]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-forest"
          >
            YES OR NO
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/suggest"
              className="hidden h-8 items-center rounded-full bg-forest px-3.5 text-xs font-semibold text-white transition-colors hover:bg-forest-2 sm:inline-flex"
            >
              + 提一题
            </Link>
            <UserMenu
              nickname={profile?.nickname ?? "我"}
              avatarUrl={profile?.avatar_url ?? null}
              isAdmin={profile?.is_admin ?? false}
            />
          </div>
        </div>
        <CategoryNav categories={categories ?? []} />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}

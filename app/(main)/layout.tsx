import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-cream/80 px-5 backdrop-blur">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-forest leading-none"
        >
          YES <span className="italic font-normal text-ink-soft">or</span> NO
        </Link>
        <UserMenu
          nickname={profile?.nickname ?? "我"}
          avatarUrl={profile?.avatar_url ?? null}
          isAdmin={profile?.is_admin ?? false}
        />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}

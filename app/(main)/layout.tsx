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
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          假设
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

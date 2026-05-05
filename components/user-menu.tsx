"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({
  nickname,
  avatarUrl,
  isAdmin,
}: {
  nickname: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("登出失败:" + error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-jade rounded-full">
        <Avatar className="h-9 w-9 ring-1 ring-border">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={nickname} />}
          <AvatarFallback className="bg-jade text-white font-display font-semibold">
            {nickname.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-semibold">{nickname}</span>
          {isAdmin && (
            <span className="text-xs font-display italic text-forest">管理员</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/me")}>
          个人中心
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/suggest")}>
          提议新题
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => router.push("/admin/suggestions")}>
            审核队列
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

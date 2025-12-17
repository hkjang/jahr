"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, LogOut, User, Settings, ChevronDown } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { ThemeToggle } from "@/components/providers";
import { FavoritesMenu } from "./FavoritesMenu";
import { RecentWork } from "./RecentWork";
import Link from "next/link";

interface PortalHeaderProps {
  onMenuClick?: () => void;
}

export function PortalHeader({ onMenuClick }: PortalHeaderProps) {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)] dark:bg-[var(--background)] border-b border-[var(--border)]">
      {/* 상단 영역: 메뉴, 검색, 알림, 프로필 */}
      <div className="h-16 px-6 flex items-center justify-between">
        {/* 왼쪽: 메뉴 버튼 (모바일) + 검색 */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[var(--background-tertiary)] rounded-lg"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5 text-[var(--foreground-tertiary)]" />
          </button>

          {/* 글로벌 검색 */}
          <div className="hidden md:block w-80">
            <GlobalSearch placeholder="사번, 이름, 부서 검색..." />
          </div>
        </div>

        {/* 오른쪽: 테마 전환, 알림 & 프로필 */}
        <div className="flex items-center gap-3">
          {/* 최근 작업 */}
          <div className="hidden md:block">
            <RecentWork />
          </div>

          {/* 테마 전환 */}
          <ThemeToggle />

          {/* 알림 */}
          <Link href="/portal/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-[var(--foreground-tertiary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error)] rounded-full" />
              <span className="sr-only">알림</span>
            </Button>
          </Link>

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 hover:bg-[var(--background-tertiary)] rounded-xl transition-colors">
                <Avatar size="sm">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {session?.user?.positionName} · {session?.user?.organizationName}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)] hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/portal/profile" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  프로필
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 하단 영역: 브레드크럼 + 즐겨찾기 */}
      <div className="px-6 py-2 border-t border-[var(--border-light)] flex items-center justify-between bg-[var(--background-secondary)]">
        {/* 브레드크럼 */}
        <Breadcrumb className="text-[var(--foreground-tertiary)]" />

        {/* 즐겨찾기 메뉴 */}
        <div className="hidden lg:block">
          <FavoritesMenu />
        </div>
      </div>
    </header>
  );
}

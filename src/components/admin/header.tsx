"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, LogOut, User, Settings, ChevronDown, Search, ExternalLink } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 h-16 bg-gray-900 border-b border-gray-800">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* 왼쪽: 메뉴 버튼 (모바일) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>

        {/* 검색 */}
        <div className="hidden md:block flex-1 max-w-md">
          <Input
            placeholder="검색..."
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500"
          />
        </div>

        {/* 오른쪽: 알림 & 프로필 */}
        <div className="flex items-center gap-3">
          {/* 포털 이동 */}
          <Link href="/portal/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              포털
            </Button>
          </Link>

          {/* 알림 */}
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-gray-800">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl transition-colors">
                <Avatar size="sm">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">관리자</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>관리자 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  프로필
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
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
    </header>
  );
}

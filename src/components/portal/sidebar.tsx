"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Calendar,
  Clock,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FileCheck,
  Bell,
  Settings,
  Building2,
  X,
} from "lucide-react";

const menuItems = [
  {
    title: "대시보드",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "내 정보",
    href: "/portal/profile",
    icon: User,
  },
  {
    title: "근태 관리",
    href: "/portal/attendance",
    icon: Clock,
  },
  {
    title: "휴가 신청",
    href: "/portal/leave",
    icon: Calendar,
  },
  {
    title: "급여 명세서",
    href: "/portal/salary",
    icon: CreditCard,
  },
  {
    title: "평가",
    href: "/portal/evaluation",
    icon: TrendingUp,
  },
  {
    title: "교육",
    href: "/portal/training",
    icon: GraduationCap,
  },
  {
    title: "결재함",
    href: "/portal/approval",
    icon: FileCheck,
  },
  {
    title: "알림",
    href: "/portal/notifications",
    icon: Bell,
  },
  {
    title: "설정",
    href: "/portal/settings",
    icon: Settings,
  },
];

interface PortalSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function PortalSidebar({ open = true, onClose }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 로고 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/portal/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JaHR
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

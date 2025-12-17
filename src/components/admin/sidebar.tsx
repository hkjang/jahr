"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTabNavigation } from "@/hooks";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FileCheck,
  BarChart3,
  Settings,
  Shield,
  Database,
  X,
  Briefcase,
  Sparkles,
  Target,
  Home,
  FolderKanban,
} from "lucide-react";

const menuGroups = [
  {
    label: "개요",
    items: [
      { title: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "인사 관리",
    items: [
      { title: "직원 관리", href: "/admin/employees", icon: Users },
      { title: "조직 관리", href: "/admin/organization", icon: Building2 },
    ],
  },
  {
    label: "OKR/성과",
    items: [
      { title: "OKR 관리", href: "/admin/okr", icon: Target },
      { title: "평가 관리", href: "/admin/evaluation", icon: TrendingUp },
      { title: "다면 평가", href: "/admin/peer-review", icon: Users },
    ],
  },
  {
    label: "근태/급여",
    items: [
      { title: "근태 관리", href: "/admin/attendance", icon: Clock },
      { title: "휴가 관리", href: "/admin/leave", icon: Calendar },
      { title: "유연 근무", href: "/admin/flex-work", icon: Home },
      { title: "급여 관리", href: "/admin/salary", icon: CreditCard },
    ],
  },
  {
    label: "인재 개발",
    items: [
      { title: "교육 관리", href: "/admin/training", icon: GraduationCap },
      { title: "프로젝트", href: "/admin/projects", icon: FolderKanban },
      { title: "스킬 관리", href: "/admin/skills", icon: Briefcase },
    ],
  },
  {
    label: "업무",
    items: [
      { title: "결재 관리", href: "/admin/approval", icon: FileCheck },
      { title: "통계/리포트", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "채용 관리",
    items: [
      { title: "채용 공고", href: "/admin/recruitment/postings", icon: Briefcase },
      { title: "파이프라인", href: "/admin/recruitment/pipeline", icon: TrendingUp },
      { title: "인재풀", href: "/admin/recruitment/talent-pool", icon: Users },
    ],
  },
  {
    label: "전략 HR",
    items: [
      { title: "인력 계획", href: "/admin/hr-strategy/workforce", icon: Users },
      { title: "정원 관리", href: "/admin/hr-strategy/headcount", icon: Building2 },
      { title: "시뮬레이션", href: "/admin/hr-strategy/simulation", icon: TrendingUp },
      { title: "HR 분석", href: "/admin/hr-analytics", icon: TrendingUp },
    ],
  },
  {
    label: "규정 관리",
    items: [
      { title: "인사 규정", href: "/admin/policies", icon: FileCheck },
      { title: "증명서", href: "/admin/certificates", icon: FileCheck },
      { title: "컴플라이언스", href: "/admin/compliance", icon: Shield },
      { title: "데이터 거버넌스", href: "/admin/data-governance", icon: Database },
    ],
  },
  {
    label: "시스템",
    items: [
      { title: "AI 설정", href: "/admin/ai-settings", icon: Sparkles },
      { title: "권한 관리", href: "/admin/permissions", icon: Shield },
      { title: "코드 관리", href: "/admin/codes", icon: Database },
      { title: "API 관리", href: "/admin/api-management", icon: Settings },
      { title: "운영 현황", href: "/admin/operations", icon: Settings },
      { title: "시스템 설정", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ open = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { navigateToMenu } = useTabNavigation();

  // Get icon name from component
  const getIconName = (IconComponent: React.ComponentType<{ className?: string }>): string => {
    const iconNames: Record<string, string> = {
      LayoutDashboard: "LayoutDashboard",
      Users: "Users",
      Building2: "Building2",
      Clock: "Clock",
      Calendar: "Calendar",
      CreditCard: "CreditCard",
      TrendingUp: "TrendingUp",
      GraduationCap: "GraduationCap",
      FileCheck: "FileCheck",
      BarChart3: "BarChart3",
      Settings: "Settings",
      Shield: "Shield",
      Database: "Database",
      Briefcase: "Briefcase",
      Sparkles: "Sparkles",
      Target: "Target",
      Home: "Home",
      FolderKanban: "FolderKanban",
    };
    return iconNames[IconComponent.displayName || IconComponent.name] || "FileCheck";
  };

  const handleMenuClick = (
    e: React.MouseEvent,
    href: string,
    title: string,
    IconComponent: React.ComponentType<{ className?: string }>
  ) => {
    e.preventDefault();
    navigateToMenu(href, title, href, getIconName(IconComponent));
    onClose?.(); // Close mobile sidebar
  };

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
          "fixed top-0 left-0 z-50 h-screen w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 로고 */}
        <div className="sticky top-0 bg-gray-950 h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">JaHR</span>
              <span className="text-xs text-gray-500 ml-2">Admin</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="p-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleMenuClick(e, item.href, item.title, item.icon)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

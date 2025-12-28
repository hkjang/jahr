"use client";

import { useState, useEffect } from "react";
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
  Plane,
  Heart,
  Award,
  Gift,
  RefreshCw,
  Store,
  DollarSign,
  FileOutput,
  Activity,
  UserCheck,
  Wallet,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface MenuGroup {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    label: "개요",
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { title: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "인사 관리",
    icon: Users,
    items: [
      { title: "직원 관리", href: "/admin/employees", icon: Users },
      { title: "조직 관리", href: "/admin/organization", icon: Building2 },
    ],
  },
  {
    label: "OKR/성과",
    icon: Target,
    items: [
      { title: "OKR 관리", href: "/admin/okr", icon: Target },
      { title: "평가 관리", href: "/admin/evaluation", icon: TrendingUp },
      { title: "다면 평가", href: "/admin/peer-review", icon: Users },
    ],
  },
  {
    label: "근태/급여",
    icon: Clock,
    items: [
      { title: "근태 관리", href: "/admin/attendance", icon: Clock },
      { title: "휴가 관리", href: "/admin/leave", icon: Calendar },
      { title: "유연 근무", href: "/admin/flex-work", icon: Home },
      { title: "근무 일정", href: "/admin/work-schedules", icon: CalendarCheck },
      { title: "급여 관리", href: "/admin/salary", icon: CreditCard },
      { title: "급여 계산", href: "/admin/payroll/calculate", icon: DollarSign },
      { title: "임금 밴드", href: "/admin/payroll/bands", icon: BarChart3 },
    ],
  },
  {
    label: "인재 개발",
    icon: GraduationCap,
    items: [
      { title: "교육 관리", href: "/admin/training", icon: GraduationCap },
      { title: "프로젝트", href: "/admin/projects", icon: FolderKanban },
      { title: "스킬 관리", href: "/admin/skills", icon: Briefcase },
      { title: "인재 관리", href: "/admin/talent", icon: UserCheck },
      { title: "승진 관리", href: "/admin/promotions", icon: Award },
    ],
  },
  {
    label: "업무",
    icon: FileCheck,
    items: [
      { title: "결재 관리", href: "/admin/approval", icon: FileCheck },
      { title: "통계/리포트", href: "/admin/reports", icon: BarChart3 },
      { title: "출장 관리", href: "/admin/business-trips", icon: Plane },
      { title: "데이터 내보내기", href: "/admin/export", icon: FileOutput },
    ],
  },
  {
    label: "채용 관리",
    icon: Briefcase,
    items: [
      { title: "채용 공고", href: "/admin/recruitment/postings", icon: Briefcase },
      { title: "파이프라인", href: "/admin/recruitment/pipeline", icon: TrendingUp },
      { title: "인재풀", href: "/admin/recruitment/talent-pool", icon: Users },
    ],
  },
  {
    label: "전략 HR",
    icon: TrendingUp,
    items: [
      { title: "인력 계획", href: "/admin/hr-strategy/workforce", icon: Users },
      { title: "정원 관리", href: "/admin/hr-strategy/headcount", icon: Building2 },
      { title: "시뮬레이션", href: "/admin/hr-strategy/simulation", icon: TrendingUp },
      { title: "조직 개편", href: "/admin/hr-strategy/restructure", icon: RefreshCw },
      { title: "인건비 예측", href: "/admin/hr-strategy/labor-cost", icon: DollarSign },
      { title: "HR 분석", href: "/admin/hr-analytics", icon: TrendingUp },
      { title: "HR 애널리틱스", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "규정 관리",
    icon: Shield,
    items: [
      { title: "인사 규정", href: "/admin/policies", icon: FileCheck },
      { title: "증명서", href: "/admin/certificates", icon: FileCheck },
      { title: "컴플라이언스", href: "/admin/compliance", icon: Shield },
      { title: "데이터 거버넌스", href: "/admin/data-governance", icon: Database },
    ],
  },
  {
    label: "시스템",
    icon: Settings,
    items: [
      { title: "AI 설정", href: "/admin/ai-settings", icon: Sparkles },
      { title: "AI 인사이트", href: "/admin/ai-insights", icon: Activity },
      { title: "권한 관리", href: "/admin/permissions", icon: Shield },
      { title: "코드 관리", href: "/admin/codes", icon: Database },
      { title: "API 관리", href: "/admin/api-management", icon: Settings },
      { title: "운영 현황", href: "/admin/operations", icon: Settings },
      { title: "라이프사이클", href: "/admin/lifecycle", icon: RefreshCw },
      { title: "시스템 설정", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "복리후생",
    icon: Heart,
    items: [
      { title: "복리후생", href: "/admin/welfare", icon: Heart },
      { title: "보험 관리", href: "/admin/insurance/national", icon: Shield },
      { title: "보험 상품", href: "/admin/insurance/private", icon: Wallet },
      { title: "퇴직금", href: "/admin/severance", icon: DollarSign },
      { title: "휴가 장려", href: "/admin/leave-promotion", icon: Gift },
      { title: "R&R", href: "/admin/rnr", icon: Award },
      { title: "마켓플레이스", href: "/admin/marketplace", icon: Store },
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

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Open groups that are default open or contain current path
    menuGroups.forEach(group => {
      if (group.defaultOpen || group.items.some(item => pathname?.startsWith(item.href))) {
        initial.add(group.label);
      }
    });
    return initial;
  });

  // Auto-expand group containing current path
  useEffect(() => {
    if (pathname) {
      menuGroups.forEach(group => {
        if (group.items.some(item => pathname.startsWith(item.href))) {
          setExpandedGroups(prev => new Set(prev).add(group.label));
        }
      });
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  // Get icon name from component
  const getIconName = (IconComponent: LucideIcon): string => {
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
      Plane: "Plane",
      Heart: "Heart",
      Award: "Award",
      Gift: "Gift",
      RefreshCw: "RefreshCw",
      Store: "Store",
      DollarSign: "DollarSign",
      FileOutput: "FileOutput",
      Activity: "Activity",
      UserCheck: "UserCheck",
      Wallet: "Wallet",
      CalendarCheck: "CalendarCheck",
    };
    return iconNames[IconComponent.displayName || IconComponent.name] || "FileCheck";
  };

  const handleMenuClick = (
    e: React.MouseEvent,
    href: string,
    title: string,
    IconComponent: LucideIcon
  ) => {
    e.preventDefault();
    navigateToMenu(href, title, href, getIconName(IconComponent));
    onClose?.(); // Close mobile sidebar
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => pathname?.startsWith(item.href));
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
          "fixed top-0 left-0 z-50 h-screen w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 로고 */}
        <div className="sticky top-0 bg-gray-950 h-16 flex items-center justify-between px-6 border-b border-gray-800 z-10">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">JaHR</span>
              <span className="text-xs text-blue-400 ml-2">Admin</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="p-3 space-y-1 pb-6">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.label);
            const hasActiveItem = isGroupActive(group);
            const GroupIcon = group.icon;

            return (
              <div key={group.label} className="mb-1">
                {/* 그룹 헤더 - 클릭하여 펼치기/접기 */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    hasActiveItem
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className={cn(
                      "w-4 h-4",
                      hasActiveItem ? "text-blue-400" : "text-gray-500 group-hover:text-gray-400"
                    )} />
                    <span>{group.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      hasActiveItem ? "bg-blue-600/20 text-blue-400" : "bg-gray-800 text-gray-500"
                    )}>
                      {group.items.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* 서브메뉴 아이템들 */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="ml-4 pl-3 border-l border-gray-800 mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const ItemIcon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleMenuClick(e, item.href, item.title, item.icon)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                            isActive
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          )}
                        >
                          <ItemIcon className="w-4 h-4" />
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* 하단 정보 */}
        <div className="sticky bottom-0 bg-gray-950 border-t border-gray-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>시스템 정상</span>
          </div>
        </div>
      </aside>
    </>
  );
}

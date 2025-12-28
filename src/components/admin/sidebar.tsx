"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Search,
  Star,
  History,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  keywords?: string[];
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
      { title: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard, keywords: ["home", "홈", "메인"] },
    ],
  },
  {
    label: "인사 관리",
    icon: Users,
    items: [
      { title: "직원 관리", href: "/admin/employees", icon: Users, keywords: ["사원", "인원", "employee"] },
      { title: "조직 관리", href: "/admin/organization", icon: Building2, keywords: ["부서", "팀", "org"] },
    ],
  },
  {
    label: "OKR/성과",
    icon: Target,
    items: [
      { title: "OKR 관리", href: "/admin/okr", icon: Target, keywords: ["목표", "objective", "key result"] },
      { title: "평가 관리", href: "/admin/evaluation", icon: TrendingUp, keywords: ["성과", "리뷰", "review"] },
      { title: "다면 평가", href: "/admin/peer-review", icon: Users, keywords: ["360", "피어", "동료"] },
    ],
  },
  {
    label: "근태/급여",
    icon: Clock,
    items: [
      { title: "근태 관리", href: "/admin/attendance", icon: Clock, keywords: ["출퇴근", "attendance"] },
      { title: "휴가 관리", href: "/admin/leave", icon: Calendar, keywords: ["연차", "vacation", "휴일"] },
      { title: "유연 근무", href: "/admin/flex-work", icon: Home, keywords: ["재택", "remote", "flexible"] },
      { title: "근무 일정", href: "/admin/work-schedules", icon: CalendarCheck, keywords: ["스케줄", "schedule"] },
      { title: "급여 관리", href: "/admin/salary", icon: CreditCard, keywords: ["월급", "pay", "salary"] },
      { title: "급여 계산", href: "/admin/payroll/calculate", icon: DollarSign, keywords: ["payroll", "계산"] },
      { title: "임금 밴드", href: "/admin/payroll/bands", icon: BarChart3, keywords: ["호봉", "band"] },
    ],
  },
  {
    label: "인재 개발",
    icon: GraduationCap,
    items: [
      { title: "교육 관리", href: "/admin/training", icon: GraduationCap, keywords: ["training", "연수"] },
      { title: "프로젝트", href: "/admin/projects", icon: FolderKanban, keywords: ["project", "업무"] },
      { title: "스킬 관리", href: "/admin/skills", icon: Briefcase, keywords: ["skill", "역량"] },
      { title: "인재 관리", href: "/admin/talent", icon: UserCheck, keywords: ["talent"] },
      { title: "승진 관리", href: "/admin/promotions", icon: Award, keywords: ["promotion", "진급"] },
    ],
  },
  {
    label: "업무",
    icon: FileCheck,
    items: [
      { title: "결재 관리", href: "/admin/approval", icon: FileCheck, keywords: ["승인", "approval"] },
      { title: "통계/리포트", href: "/admin/reports", icon: BarChart3, keywords: ["report", "통계"] },
      { title: "출장 관리", href: "/admin/business-trips", icon: Plane, keywords: ["trip", "여행"] },
      { title: "데이터 내보내기", href: "/admin/export", icon: FileOutput, keywords: ["export", "다운로드"] },
    ],
  },
  {
    label: "채용 관리",
    icon: Briefcase,
    items: [
      { title: "채용 공고", href: "/admin/recruitment/postings", icon: Briefcase, keywords: ["job", "공고"] },
      { title: "파이프라인", href: "/admin/recruitment/pipeline", icon: TrendingUp, keywords: ["pipeline"] },
      { title: "인재풀", href: "/admin/recruitment/talent-pool", icon: Users, keywords: ["pool", "후보자"] },
    ],
  },
  {
    label: "전략 HR",
    icon: TrendingUp,
    items: [
      { title: "인력 계획", href: "/admin/hr-strategy/workforce", icon: Users, keywords: ["workforce", "계획"] },
      { title: "정원 관리", href: "/admin/hr-strategy/headcount", icon: Building2, keywords: ["headcount", "TO"] },
      { title: "시뮬레이션", href: "/admin/hr-strategy/simulation", icon: TrendingUp, keywords: ["simulation"] },
      { title: "조직 개편", href: "/admin/hr-strategy/restructure", icon: RefreshCw, keywords: ["restructure"] },
      { title: "인건비 예측", href: "/admin/hr-strategy/labor-cost", icon: DollarSign, keywords: ["labor", "인건비"] },
      { title: "HR 분석", href: "/admin/hr-analytics", icon: TrendingUp, keywords: ["analytics"] },
      { title: "HR 애널리틱스", href: "/admin/analytics", icon: BarChart3, keywords: ["analytics", "분석"] },
    ],
  },
  {
    label: "규정 관리",
    icon: Shield,
    items: [
      { title: "인사 규정", href: "/admin/policies", icon: FileCheck, keywords: ["policy", "규정"] },
      { title: "증명서", href: "/admin/certificates", icon: FileCheck, keywords: ["certificate", "발급"] },
      { title: "컴플라이언스", href: "/admin/compliance", icon: Shield, keywords: ["compliance", "준수"] },
      { title: "데이터 거버넌스", href: "/admin/data-governance", icon: Database, keywords: ["governance"] },
    ],
  },
  {
    label: "시스템",
    icon: Settings,
    items: [
      { title: "AI 설정", href: "/admin/ai-settings", icon: Sparkles, keywords: ["ai", "인공지능"] },
      { title: "AI 인사이트", href: "/admin/ai-insights", icon: Activity, keywords: ["ai", "insight"] },
      { title: "권한 관리", href: "/admin/permissions", icon: Shield, keywords: ["permission", "권한"] },
      { title: "코드 관리", href: "/admin/codes", icon: Database, keywords: ["code", "공통코드"] },
      { title: "API 관리", href: "/admin/api-management", icon: Settings, keywords: ["api"] },
      { title: "운영 현황", href: "/admin/operations", icon: Settings, keywords: ["operation", "운영"] },
      { title: "라이프사이클", href: "/admin/lifecycle", icon: RefreshCw, keywords: ["lifecycle"] },
      { title: "시스템 설정", href: "/admin/settings", icon: Settings, keywords: ["setting", "설정"] },
    ],
  },
  {
    label: "복리후생",
    icon: Heart,
    items: [
      { title: "복리후생", href: "/admin/welfare", icon: Heart, keywords: ["welfare", "복지"] },
      { title: "보험 관리", href: "/admin/insurance/national", icon: Shield, keywords: ["insurance", "보험"] },
      { title: "보험 상품", href: "/admin/insurance/private", icon: Wallet, keywords: ["insurance"] },
      { title: "퇴직금", href: "/admin/severance", icon: DollarSign, keywords: ["severance", "퇴직"] },
      { title: "휴가 장려", href: "/admin/leave-promotion", icon: Gift, keywords: ["휴가", "장려"] },
      { title: "R&R", href: "/admin/rnr", icon: Award, keywords: ["reward", "보상"] },
      { title: "마켓플레이스", href: "/admin/marketplace", icon: Store, keywords: ["market", "쇼핑"] },
    ],
  },
];

// Flatten all menu items for search
const allMenuItems = menuGroups.flatMap(group =>
  group.items.map(item => ({ ...item, group: group.label }))
);

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const FAVORITES_KEY = "admin-sidebar-favorites";
const RECENT_KEY = "admin-sidebar-recent";
const COLLAPSED_KEY = "admin-sidebar-collapsed";

export function AdminSidebar({ open = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { navigateToMenu } = useTabNavigation();

  // States
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["개요"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved state
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    const savedRecent = localStorage.getItem(RECENT_KEY);
    const savedCollapsed = localStorage.getItem(COLLAPSED_KEY);

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentPages(JSON.parse(savedRecent));
    if (savedCollapsed) setIsCollapsed(savedCollapsed === "true");
  }, []);

  // Auto-expand group containing current path
  useEffect(() => {
    if (pathname) {
      menuGroups.forEach(group => {
        if (group.items.some(item => pathname.startsWith(item.href))) {
          setExpandedGroups(prev => new Set(prev).add(group.label));
        }
      });

      // Add to recent pages
      if (pathname !== "/admin/dashboard") {
        setRecentPages(prev => {
          const updated = [pathname, ...prev.filter(p => p !== pathname)].slice(0, 5);
          localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allMenuItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.keywords?.some(k => k.toLowerCase().includes(query)) ||
      item.group.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery]);

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

  const toggleFavorite = (href: string) => {
    setFavorites(prev => {
      const updated = prev.includes(href)
        ? prev.filter(f => f !== href)
        : [...prev, href];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      localStorage.setItem(COLLAPSED_KEY, String(!prev));
      return !prev;
    });
  };

  const getIconName = (IconComponent: LucideIcon): string => {
    const iconNames: Record<string, string> = {
      LayoutDashboard: "LayoutDashboard", Users: "Users", Building2: "Building2",
      Clock: "Clock", Calendar: "Calendar", CreditCard: "CreditCard",
      TrendingUp: "TrendingUp", GraduationCap: "GraduationCap", FileCheck: "FileCheck",
      BarChart3: "BarChart3", Settings: "Settings", Shield: "Shield",
      Database: "Database", Briefcase: "Briefcase", Sparkles: "Sparkles",
      Target: "Target", Home: "Home", FolderKanban: "FolderKanban",
      Plane: "Plane", Heart: "Heart", Award: "Award", Gift: "Gift",
      RefreshCw: "RefreshCw", Store: "Store", DollarSign: "DollarSign",
      FileOutput: "FileOutput", Activity: "Activity", UserCheck: "UserCheck",
      Wallet: "Wallet", CalendarCheck: "CalendarCheck",
    };
    return iconNames[IconComponent.displayName || IconComponent.name] || "FileCheck";
  };

  const handleMenuClick = useCallback((
    e: React.MouseEvent,
    href: string,
    title: string,
    IconComponent: LucideIcon
  ) => {
    e.preventDefault();
    navigateToMenu(href, title, href, getIconName(IconComponent));
    onClose?.();
    setSearchOpen(false);
    setSearchQuery("");
  }, [navigateToMenu, onClose]);

  const handleSearchSelect = (item: typeof allMenuItems[0]) => {
    router.push(item.href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => pathname?.startsWith(item.href));
  };

  const favoriteItems = allMenuItems.filter(item => favorites.includes(item.href));
  const recentItems = recentPages.map(href => allMenuItems.find(item => item.href === href)).filter(Boolean) as typeof allMenuItems;

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 검색 모달 */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-lg bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메뉴 검색... (Ctrl+K)"
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm"
                autoFocus
              />
              <kbd className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">ESC</kbd>
            </div>
            {searchResults.length > 0 && (
              <div className="p-2 max-h-80 overflow-y-auto">
                {searchResults.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-800 transition-colors"
                    >
                      <ItemIcon className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.group}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-gray-950 border-r border-gray-800 transform transition-all duration-300 ease-in-out overflow-hidden",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* 로고 */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
            {!isCollapsed ? (
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">JaHR</span>
                  <span className="text-xs text-blue-400 ml-1">Admin</span>
                </div>
              </Link>
            ) : (
              <Link href="/admin/dashboard" className="mx-auto">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}
            {!isCollapsed && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* 검색 버튼 */}
          {!isCollapsed && (
            <div className="px-3 py-2 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 bg-gray-900 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">메뉴 검색...</span>
                <kbd className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>
            </div>
          )}

          {/* 빠른 접근 (즐겨찾기) */}
          {!isCollapsed && favoriteItems.length > 0 && (
            <div className="px-3 py-2 flex-shrink-0 border-b border-gray-800">
              <div className="flex items-center gap-2 px-2 mb-2 text-xs text-gray-500">
                <Star className="w-3 h-3" />
                <span>즐겨찾기</span>
              </div>
              <div className="space-y-0.5">
                {favoriteItems.slice(0, 3).map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleMenuClick(e, item.href, item.title, item.icon)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors",
                        pathname === item.href
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 최근 방문 */}
          {!isCollapsed && recentItems.length > 0 && (
            <div className="px-3 py-2 flex-shrink-0 border-b border-gray-800">
              <div className="flex items-center gap-2 px-2 mb-2 text-xs text-gray-500">
                <History className="w-3 h-3" />
                <span>최근 방문</span>
              </div>
              <div className="space-y-0.5">
                {recentItems.slice(0, 3).map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleMenuClick(e, item.href, item.title, item.icon)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 메뉴 */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {menuGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.label);
              const hasActiveItem = isGroupActive(group);
              const GroupIcon = group.icon;

              if (isCollapsed) {
                // 축소 모드: 아이콘만 표시
                const firstItem = group.items[0];
                return (
                  <div key={group.label} className="relative group">
                    <Link
                      href={firstItem.href}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors",
                        hasActiveItem
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <GroupIcon className="w-5 h-5" />
                    </Link>
                    {/* 툴팁 */}
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                      <div className="bg-gray-800 rounded-lg py-2 px-3 shadow-xl border border-gray-700 whitespace-nowrap">
                        <div className="text-xs font-medium text-white mb-1">{group.label}</div>
                        {group.items.map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block text-xs text-gray-400 hover:text-white py-1"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={group.label} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
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
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        hasActiveItem ? "bg-blue-600/20 text-blue-400" : "bg-gray-800 text-gray-500"
                      )}>
                        {group.items.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-4 pl-3 border-l border-gray-800 mt-1 space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        const isFavorite = favorites.includes(item.href);
                        const ItemIcon = item.icon;

                        return (
                          <div key={item.href} className="relative group/item flex items-center">
                            <Link
                              href={item.href}
                              onClick={(e) => handleMenuClick(e, item.href, item.title, item.icon)}
                              className={cn(
                                "flex-1 flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all",
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              )}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span className="truncate">{item.title}</span>
                            </Link>
                            <button
                              onClick={() => toggleFavorite(item.href)}
                              className={cn(
                                "absolute right-1 p-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity",
                                isFavorite ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"
                              )}
                            >
                              <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* 하단 */}
          <div className="flex-shrink-0 border-t border-gray-800 px-3 py-2">
            <button
              onClick={toggleCollapsed}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
            >
              {isCollapsed ? (
                <ChevronsRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronsLeft className="w-4 h-4" />
                  <span>사이드바 접기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

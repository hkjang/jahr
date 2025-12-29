"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ExternalLink,
  ChevronRight,
  Home,
  Check,
  Clock,
  FileText,
  Users,
  AlertCircle,
  Sparkles,
  Command,
} from "lucide-react";
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
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

// Mock notifications
const notifications = [
  { id: 1, type: 'approval', title: '휴가 신청 결재 대기', desc: '김철수 - 연차 3일', time: '5분 전', read: false },
  { id: 2, type: 'alert', title: '급여 계산 완료', desc: '12월 급여 명세서 생성됨', time: '1시간 전', read: false },
  { id: 3, type: 'info', title: '신규 입사자 등록', desc: '박신입 - 개발팀', time: '3시간 전', read: true },
  { id: 4, type: 'system', title: '시스템 업데이트', desc: 'v2.1.0 업데이트 완료', time: '1일 전', read: true },
];

// Breadcrumb title mapping
const titleMap: Record<string, string> = {
  admin: "관리자",
  dashboard: "대시보드",
  employees: "직원 관리",
  organization: "조직 관리",
  okr: "OKR 관리",
  evaluation: "평가 관리",
  "peer-review": "다면 평가",
  attendance: "근태 관리",
  leave: "휴가 관리",
  "flex-work": "유연 근무",
  salary: "급여 관리",
  payroll: "급여",
  calculate: "급여 계산",
  bands: "임금 밴드",
  training: "교육 관리",
  projects: "프로젝트",
  skills: "스킬 관리",
  talent: "인재 관리",
  promotions: "승진 관리",
  approval: "결재 관리",
  reports: "통계/리포트",
  "business-trips": "출장 관리",
  export: "데이터 내보내기",
  recruitment: "채용 관리",
  postings: "채용 공고",
  pipeline: "파이프라인",
  "talent-pool": "인재풀",
  "hr-strategy": "전략 HR",
  workforce: "인력 계획",
  headcount: "정원 관리",
  simulation: "시뮬레이션",
  restructure: "조직 개편",
  "labor-cost": "인건비 예측",
  "hr-analytics": "HR 분석",
  analytics: "HR 애널리틱스",
  policies: "인사 규정",
  certificates: "증명서",
  compliance: "컴플라이언스",
  "data-governance": "데이터 거버넌스",
  "ai-settings": "AI 설정",
  "ai-insights": "AI 인사이트",
  permissions: "권한 관리",
  codes: "코드 관리",
  "api-management": "API 관리",
  operations: "운영 현황",
  lifecycle: "라이프사이클",
  settings: "시스템 설정",
  welfare: "복리후생",
  insurance: "보험 관리",
  national: "국민보험",
  private: "보험 상품",
  severance: "퇴직금",
  "leave-promotion": "휴가 장려",
  rnr: "R&R",
  marketplace: "마켓플레이스",
  "work-schedules": "근무 일정",
  mappings: "기능별 매핑",
  logs: "호출 로그",
  final: "최종 평가",
  monitor: "평가 모니터링",
};

const notificationIcons: Record<string, React.ReactNode> = {
  approval: <FileText className="w-4 h-4 text-blue-400" />,
  alert: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  info: <Users className="w-4 h-4 text-green-400" />,
  system: <Sparkles className="w-4 h-4 text-purple-400" />,
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A";

  // Generate breadcrumbs from pathname
  const pathSegments = pathname?.split("/").filter(Boolean) || [];
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const title = titleMap[segment] || segment;
    return { path, title, isLast: index === pathSegments.length - 1 };
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* 왼쪽: 메뉴 버튼 (모바일) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>

        {/* 브레드크럼 */}
        <nav className="hidden lg:flex items-center gap-1 text-sm flex-1 min-w-0">
          <Link
            href="/admin/dashboard"
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.slice(1).map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-gray-600" />
              {crumb.isLast ? (
                <span className="text-white font-medium truncate max-w-[200px]">
                  {crumb.title}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-gray-400 hover:text-gray-200 transition-colors truncate max-w-[150px]"
                >
                  {crumb.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* 통합 검색 */}
        <div className="hidden md:block w-72">
          <button
            onClick={() => {
              // Trigger Ctrl+K
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
            }}
            className="w-full flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-400 hover:bg-gray-700 transition-colors"
          >
            <Command className="w-4 h-4" />
            <span className="flex-1 text-left">검색...</span>
            <kbd className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* 오른쪽: 알림 & 프로필 */}
        <div className="flex items-center gap-2">
          {/* 포털 이동 */}
          <Link href="/portal/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ExternalLink className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">포털</span>
            </Button>
          </Link>

          {/* 알림 드롭다운 */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-700">
              <DropdownMenuLabel className="flex items-center justify-between py-3">
                <span className="text-white">알림</span>
                <button className="text-xs text-blue-400 hover:text-blue-300">
                  모두 읽음 처리
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer focus:bg-gray-800",
                      !notif.read && "bg-gray-800/50"
                    )}
                  >
                    <div className="mt-0.5">
                      {notificationIcons[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{notif.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="p-3 focus:bg-gray-800">
                <Link href="/admin/notifications" className="flex items-center justify-center text-sm text-blue-400 hover:text-blue-300">
                  모든 알림 보기
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-xl transition-colors">
                <Avatar size="sm">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white leading-tight">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">관리자</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
              <DropdownMenuLabel className="text-gray-300">관리자 계정</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="focus:bg-gray-800 cursor-pointer">
                <Link href="/admin/profile" className="text-gray-300">
                  <User className="w-4 h-4 mr-2" />
                  프로필
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-gray-800 cursor-pointer">
                <Link href="/admin/settings" className="text-gray-300">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-400 focus:text-red-400 focus:bg-gray-800 cursor-pointer"
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

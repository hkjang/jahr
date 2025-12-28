"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { TabBar, TabRecoveryDialog } from "@/components/tab";
import { useTabStore } from "@/lib/stores/tab-store";
import { useTabKeyboard } from "@/hooks";
import { ROLES } from "@/lib/constants";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tab store and keyboard shortcuts
  const { tabs, openTab, restoreSession } = useTabStore();
  useTabKeyboard({ enabled: true });

  // Initialize tab system on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Sync current path with tabs
  useEffect(() => {
    if (pathname && status === "authenticated") {
      // Get page title from pathname
      const pathSegments = pathname.split("/").filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];
      const title = getPageTitle(pathname, lastSegment);

      // Open or focus the tab for current path
      if (!tabs.find((t) => t.path === pathname)) {
        openTab({
          path: pathname,
          title,
          menuId: pathname,
          icon: getPageIcon(pathname),
        });
      }
    }
  }, [pathname, status, tabs, openTab]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // 관리자 권한 체크
    if (status === "authenticated" && session?.user?.roles) {
      const hasAdminRole = session.user.roles.some(
        (role) => role === ROLES.HR_ADMIN || role === ROLES.SYSTEM_ADMIN
      );
      if (!hasAdminRole) {
        router.push("/portal/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <TabBar />
        <main className="p-6">{children}</main>
      </div>
      <TabRecoveryDialog />
    </div>
  );
}

// Helper function to get page title from pathname
function getPageTitle(pathname: string, lastSegment: string): string {
  const titleMap: Record<string, string> = {
    dashboard: "대시보드",
    employees: "직원 관리",
    organization: "조직 관리",
    attendance: "근태 관리",
    leave: "휴가 관리",
    salary: "급여 관리",
    evaluation: "평가 관리",
    training: "교육 관리",
    approval: "결재 관리",
    reports: "통계/리포트",
    postings: "채용 공고",
    pipeline: "파이프라인",
    "talent-pool": "인재풀",
    workforce: "인력 계획",
    headcount: "정원 관리",
    simulation: "시뮬레이션",
    "hr-analytics": "HR 분석",
    policies: "인사 규정",
    certificates: "증명서",
    compliance: "컴플라이언스",
    "data-governance": "데이터 거버넌스",
    permissions: "권한 관리",
    codes: "코드 관리",
    "api-management": "API 관리",
    operations: "운영 현황",
    settings: "시스템 설정",
    "ai-insights": "AI 인사이트",
    "ai-settings": "AI 설정",
    mappings: "기능별 모델 매핑",
    logs: "AI 호출 로그",
    marketplace: "마켓플레이스",
    lifecycle: "라이프사이클",
    skills: "스킬 관리",
    okr: "OKR 관리",
    "peer-review": "다면 평가",
    "flex-work": "유연 근무",
    projects: "프로젝트",
    recruitment: "채용 관리",
    "business-trips": "출장 관리",
    export: "데이터 내보내기",
    restructure: "조직 개편",
    "labor-cost": "인건비 예측",
    analytics: "HR 애널리틱스",
    welfare: "복리후생",
    insurance: "보험 관리",
    national: "국민보험",
    private: "보험 상품",
    severance: "퇴직금",
    "leave-promotion": "휴가 장려",
    rnr: "R&R",
    talent: "인재 관리",
    promotions: "승진 관리",
    "work-schedules": "근무 일정",
    calculate: "급여 계산",
    bands: "임금 밴드",
    payroll: "급여",
    final: "최종 평가",
    monitor: "평가 모니터링",
  };

  return titleMap[lastSegment] || lastSegment;
}

// Helper function to get page icon from pathname
function getPageIcon(pathname: string): string {
  const iconMap: Record<string, string> = {
    "/admin/dashboard": "LayoutDashboard",
    "/admin/employees": "Users",
    "/admin/organization": "Building2",
    "/admin/attendance": "Clock",
    "/admin/leave": "Calendar",
    "/admin/salary": "CreditCard",
    "/admin/evaluation": "TrendingUp",
    "/admin/training": "GraduationCap",
    "/admin/approval": "FileCheck",
    "/admin/reports": "BarChart3",
    "/admin/recruitment": "Briefcase",
    "/admin/hr-strategy": "TrendingUp",
    "/admin/hr-analytics": "TrendingUp",
    "/admin/policies": "FileCheck",
    "/admin/certificates": "FileCheck",
    "/admin/compliance": "Shield",
    "/admin/data-governance": "Database",
    "/admin/permissions": "Shield",
    "/admin/codes": "Database",
    "/admin/api-management": "Settings",
    "/admin/operations": "Settings",
    "/admin/settings": "Settings",
    "/admin/okr": "Target",
    "/admin/peer-review": "Users",
    "/admin/flex-work": "Home",
    "/admin/work-schedules": "CalendarCheck",
    "/admin/payroll": "DollarSign",
    "/admin/projects": "FolderKanban",
    "/admin/skills": "Briefcase",
    "/admin/talent": "UserCheck",
    "/admin/promotions": "Award",
    "/admin/business-trips": "Plane",
    "/admin/export": "FileOutput",
    "/admin/analytics": "BarChart3",
    "/admin/ai-insights": "Activity",
    "/admin/ai-settings": "Sparkles",
    "/admin/lifecycle": "RefreshCw",
    "/admin/welfare": "Heart",
    "/admin/insurance": "Shield",
    "/admin/severance": "DollarSign",
    "/admin/leave-promotion": "Gift",
    "/admin/rnr": "Award",
    "/admin/marketplace": "Store",
  };

  // Check for exact match first, then prefix match
  if (iconMap[pathname]) {
    return iconMap[pathname];
  }

  for (const [path, icon] of Object.entries(iconMap)) {
    if (pathname.startsWith(path)) {
      return icon;
    }
  }

  return "FileCheck";
}


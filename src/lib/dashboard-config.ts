// Dashboard Configuration - 직급·역할·부서별 위젯 구성
import { LucideIcon } from "lucide-react";

// 위젯 타입 정의
export type WidgetType =
  | "stats"      // 통계 카드
  | "chart"      // 차트
  | "list"       // 목록
  | "quickAction" // 빠른 액션
  | "calendar"   // 캘린더
  | "notification"; // 알림

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  icon?: LucideIcon;
  size: WidgetSize;
  order: number;
  visible: boolean;
  config?: Record<string, unknown>;
}

export interface DashboardLayout {
  roleCode: string;
  widgets: WidgetConfig[];
}

// 역할별 기본 대시보드 레이아웃
export const DEFAULT_DASHBOARD_LAYOUTS: Record<string, WidgetConfig[]> = {
  // 일반 직원
  EMPLOYEE: [
    {
      id: "my-attendance",
      type: "stats",
      title: "내 출퇴근",
      size: "small",
      order: 1,
      visible: true,
      config: { dataSource: "attendance" },
    },
    {
      id: "my-leave-balance",
      type: "stats",
      title: "잔여 휴가",
      size: "small",
      order: 2,
      visible: true,
      config: { dataSource: "leaveBalance" },
    },
    {
      id: "quick-actions",
      type: "quickAction",
      title: "빠른 액션",
      size: "medium",
      order: 3,
      visible: true,
    },
    {
      id: "my-approvals",
      type: "list",
      title: "결재 현황",
      size: "medium",
      order: 4,
      visible: true,
      config: { dataSource: "myApprovals", limit: 5 },
    },
    {
      id: "notifications",
      type: "notification",
      title: "알림",
      size: "medium",
      order: 5,
      visible: true,
      config: { limit: 5 },
    },
  ],

  // 팀장
  TEAM_LEADER: [
    {
      id: "team-stats",
      type: "stats",
      title: "팀 현황",
      size: "small",
      order: 1,
      visible: true,
      config: { dataSource: "teamStats" },
    },
    {
      id: "team-attendance",
      type: "chart",
      title: "팀 출근 현황",
      size: "medium",
      order: 2,
      visible: true,
      config: { chartType: "bar", dataSource: "teamAttendance" },
    },
    {
      id: "pending-approvals",
      type: "list",
      title: "대기 중 결재",
      size: "medium",
      order: 3,
      visible: true,
      config: { dataSource: "pendingApprovals", limit: 10 },
    },
    {
      id: "quick-actions",
      type: "quickAction",
      title: "빠른 액션",
      size: "small",
      order: 4,
      visible: true,
    },
    {
      id: "team-leave-calendar",
      type: "calendar",
      title: "팀 휴가 일정",
      size: "large",
      order: 5,
      visible: true,
    },
  ],

  // HR 관리자
  HR_ADMIN: [
    {
      id: "company-stats",
      type: "stats",
      title: "전사 인원 현황",
      size: "small",
      order: 1,
      visible: true,
    },
    {
      id: "new-hires",
      type: "stats",
      title: "신규 입사자",
      size: "small",
      order: 2,
      visible: true,
    },
    {
      id: "resignations",
      type: "stats",
      title: "퇴사자",
      size: "small",
      order: 3,
      visible: true,
    },
    {
      id: "attendance-rate",
      type: "stats",
      title: "출근율",
      size: "small",
      order: 4,
      visible: true,
    },
    {
      id: "org-chart",
      type: "chart",
      title: "부서별 인원",
      size: "medium",
      order: 5,
      visible: true,
      config: { chartType: "pie" },
    },
    {
      id: "attendance-trend",
      type: "chart",
      title: "출근 추이",
      size: "medium",
      order: 6,
      visible: true,
      config: { chartType: "line" },
    },
    {
      id: "pending-approvals",
      type: "list",
      title: "대기 중 결재",
      size: "medium",
      order: 7,
      visible: true,
      config: { limit: 10 },
    },
    {
      id: "recent-activities",
      type: "list",
      title: "최근 활동",
      size: "medium",
      order: 8,
      visible: true,
      config: { limit: 10 },
    },
  ],

  // 시스템 관리자
  SYSTEM_ADMIN: [
    {
      id: "system-health",
      type: "stats",
      title: "시스템 상태",
      size: "small",
      order: 1,
      visible: true,
    },
    {
      id: "active-users",
      type: "stats",
      title: "활성 사용자",
      size: "small",
      order: 2,
      visible: true,
    },
    {
      id: "audit-logs",
      type: "list",
      title: "감사 로그",
      size: "large",
      order: 3,
      visible: true,
      config: { limit: 20 },
    },
    {
      id: "api-usage",
      type: "chart",
      title: "API 사용량",
      size: "medium",
      order: 4,
      visible: true,
      config: { chartType: "line" },
    },
  ],
};

// 위젯 사이즈별 그리드 클래스
export const WIDGET_SIZE_CLASSES: Record<WidgetSize, string> = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 lg:col-span-3",
  full: "col-span-full",
};

// 사용자 위젯 설정 저장 키
export const USER_DASHBOARD_STORAGE_KEY = "dashboard_layout";

// 기본 위젯 가져오기
export function getDefaultLayoutForRole(roleCode: string): WidgetConfig[] {
  return DEFAULT_DASHBOARD_LAYOUTS[roleCode] || DEFAULT_DASHBOARD_LAYOUTS.EMPLOYEE;
}

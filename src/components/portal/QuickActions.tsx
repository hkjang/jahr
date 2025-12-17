"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Calendar,
  Clock,
  FileText,
  FileCheck,
  Briefcase,
  CreditCard,
  UserPlus,
  ClipboardList,
  GraduationCap,
  LucideIcon,
} from "lucide-react";

// 빠른 액션 아이템 타입
interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  badge?: string;
}

// 기본 빠른 액션 목록
const defaultQuickActions: QuickActionItem[] = [
  {
    id: "leave-request",
    title: "휴가 신청",
    description: "연차, 반차, 병가 등 휴가 신청",
    icon: Calendar,
    href: "/portal/leave/request",
    color: "blue",
  },
  {
    id: "attendance-correction",
    title: "근태 수정 요청",
    description: "출퇴근 시간 수정 요청",
    icon: Clock,
    href: "/portal/attendance/correction",
    color: "green",
  },
  {
    id: "certificate",
    title: "증명서 발급",
    description: "재직증명서, 경력증명서 발급",
    icon: FileText,
    href: "/portal/certificates",
    color: "purple",
  },
  {
    id: "expense",
    title: "경비 청구",
    description: "업무 관련 경비 청구",
    icon: CreditCard,
    href: "/portal/expense",
    color: "orange",
  },
  {
    id: "overtime",
    title: "초과근무 신청",
    description: "야근, 주말 근무 사전 신청",
    icon: Briefcase,
    href: "/portal/overtime",
    color: "red",
  },
  {
    id: "training",
    title: "교육 신청",
    description: "사내/외부 교육 수강 신청",
    icon: GraduationCap,
    href: "/portal/training/apply",
    color: "blue",
  },
];

// 팀장용 빠른 액션
const teamLeaderQuickActions: QuickActionItem[] = [
  {
    id: "approve",
    title: "결재 처리",
    description: "대기 중인 결재 승인/반려",
    icon: FileCheck,
    href: "/portal/approvals",
    color: "green",
    badge: "3",
  },
  {
    id: "team-attendance",
    title: "팀원 근태 관리",
    description: "팀원 출퇴근 현황 확인",
    icon: ClipboardList,
    href: "/portal/team/attendance",
    color: "blue",
  },
];

// HR 관리자용 빠른 액션
const hrAdminQuickActions: QuickActionItem[] = [
  {
    id: "new-employee",
    title: "신규 입사 등록",
    description: "신규 직원 정보 등록",
    icon: UserPlus,
    href: "/admin/employees/new",
    color: "green",
  },
  {
    id: "appointment",
    title: "인사 발령",
    description: "부서 이동, 승진 등 발령 처리",
    icon: Briefcase,
    href: "/admin/employees/appointment",
    color: "purple",
  },
];

// 색상 맵
const colorStyles: Record<string, { bg: string; hover: string; icon: string }> = {
  blue: {
    bg: "bg-blue-50",
    hover: "hover:bg-blue-100",
    icon: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    hover: "hover:bg-green-100",
    icon: "text-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    hover: "hover:bg-purple-100",
    icon: "text-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    hover: "hover:bg-orange-100",
    icon: "text-orange-600",
  },
  red: {
    bg: "bg-red-50",
    hover: "hover:bg-red-100",
    icon: "text-red-600",
  },
  gray: {
    bg: "bg-gray-50",
    hover: "hover:bg-gray-100",
    icon: "text-gray-600",
  },
};

// Props
interface QuickActionsProps {
  roleCode?: string;
  customActions?: QuickActionItem[];
  columns?: 2 | 3 | 4;
}

export function QuickActions({
  roleCode = "EMPLOYEE",
  customActions,
  columns = 3,
}: QuickActionsProps) {
  // 역할별 액션 합치기
  let actions = customActions || [...defaultQuickActions];

  if (roleCode === "TEAM_LEADER") {
    actions = [...teamLeaderQuickActions, ...defaultQuickActions];
  } else if (roleCode === "HR_ADMIN" || roleCode === "SYSTEM_ADMIN") {
    actions = [...hrAdminQuickActions, ...teamLeaderQuickActions, ...defaultQuickActions];
  }

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">빠른 액션</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-3`}>
          {actions.slice(0, columns === 4 ? 8 : 6).map((action) => {
            const Icon = action.icon;
            const colors = colorStyles[action.color];

            return (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-lg ${colors.bg} ${colors.hover} transition-colors group relative`}
              >
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{action.description}</p>
                </div>
                {action.badge && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-medium">
                    {action.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// 개별 빠른 액션 버튼 (미니 버전)
interface QuickActionButtonProps {
  action: QuickActionItem;
}

export function QuickActionButton({ action }: QuickActionButtonProps) {
  const Icon = action.icon;
  const colors = colorStyles[action.color];

  return (
    <Link
      href={action.href}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.hover} transition-colors`}
    >
      <Icon className={`h-4 w-4 ${colors.icon}`} />
      <span className="text-sm font-medium text-gray-700">{action.title}</span>
    </Link>
  );
}

export { defaultQuickActions, teamLeaderQuickActions, hrAdminQuickActions };
export type { QuickActionItem };

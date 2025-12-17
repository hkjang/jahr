"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  DraggableWidget,
  WidgetGrid,
  useWidgetLayout,
  AddWidgetButton,
  WidgetConfig,
} from "./DraggableWidget";
import { Card, CardContent, Badge } from "@/components/ui";
import {
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  FileCheck,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Timer,
} from "lucide-react";

// 사용자 역할 타입
type UserRole = "EMPLOYEE" | "TEAM_LEAD" | "HR_ADMIN" | "EXECUTIVE";

// 역할별 기본 위젯 구성
const roleWidgetConfigs: Record<UserRole, WidgetConfig[]> = {
  EMPLOYEE: [
    { id: "attendance", type: "attendance", title: "오늘의 근태", size: "medium", position: { row: 0, col: 0 }, visible: true },
    { id: "leave", type: "leave", title: "연차 현황", size: "small", position: { row: 0, col: 2 }, visible: true },
    { id: "salary", type: "salary", title: "급여 정보", size: "small", position: { row: 0, col: 3 }, visible: true },
    { id: "pending", type: "pending", title: "대기 중인 결재", size: "medium", position: { row: 1, col: 0 }, visible: true },
    { id: "evaluation", type: "evaluation", title: "평가 현황", size: "small", position: { row: 1, col: 2 }, visible: true },
  ],
  TEAM_LEAD: [
    { id: "approval-queue", type: "approval-queue", title: "승인 대기", size: "large", position: { row: 0, col: 0 }, visible: true },
    { id: "team-attendance", type: "team-attendance", title: "팀원 출근 현황", size: "medium", position: { row: 1, col: 0 }, visible: true },
    { id: "team-leave", type: "team-leave", title: "팀원 휴가 현황", size: "medium", position: { row: 1, col: 2 }, visible: true },
    { id: "attendance", type: "attendance", title: "내 근태", size: "small", position: { row: 2, col: 0 }, visible: true },
    { id: "pending", type: "pending", title: "내 결재 현황", size: "small", position: { row: 2, col: 1 }, visible: true },
  ],
  HR_ADMIN: [
    { id: "hr-summary", type: "hr-summary", title: "HR 요약", size: "full", position: { row: 0, col: 0 }, visible: true },
    { id: "pending-all", type: "pending-all", title: "전체 결재 대기", size: "large", position: { row: 1, col: 0 }, visible: true },
    { id: "onboarding", type: "onboarding", title: "온보딩 현황", size: "medium", position: { row: 2, col: 0 }, visible: true },
    { id: "offboarding", type: "offboarding", title: "퇴사 예정", size: "medium", position: { row: 2, col: 2 }, visible: true },
  ],
  EXECUTIVE: [
    { id: "kpi-summary", type: "kpi-summary", title: "핵심 지표", size: "full", position: { row: 0, col: 0 }, visible: true },
    { id: "headcount-chart", type: "headcount-chart", title: "인원 추이", size: "large", position: { row: 1, col: 0 }, visible: true },
    { id: "turnover", type: "turnover", title: "이직률", size: "small", position: { row: 1, col: 3 }, visible: true },
    { id: "cost-summary", type: "cost-summary", title: "인건비 요약", size: "medium", position: { row: 2, col: 0 }, visible: true },
  ],
};

// 위젯 컴포넌트 매핑
const widgetComponents: Record<string, React.ComponentType<{ isCompact?: boolean }>> = {
  attendance: AttendanceWidget,
  leave: LeaveWidget,
  salary: SalaryWidget,
  pending: PendingApprovalWidget,
  evaluation: EvaluationWidget,
  "approval-queue": ApprovalQueueWidget,
  "team-attendance": TeamAttendanceWidget,
  "team-leave": TeamLeaveWidget,
  "hr-summary": HRSummaryWidget,
  "pending-all": PendingAllWidget,
  onboarding: OnboardingWidget,
  offboarding: OffboardingWidget,
  "kpi-summary": KPISummaryWidget,
  "headcount-chart": HeadcountChartWidget,
  turnover: TurnoverWidget,
  "cost-summary": CostSummaryWidget,
};

interface RoleDashboardProps {
  defaultRole?: UserRole;
}

export function RoleDashboard({ defaultRole }: RoleDashboardProps) {
  const { data: session } = useSession();
  
  // 사용자 역할 결정 (세션에서 가져오거나 기본값 사용)
  const userRole: UserRole = React.useMemo(() => {
    if (defaultRole) return defaultRole;
    
    const roles = (session?.user as { roles?: string[] })?.roles || [];
    
    if (roles.includes("SYSTEM_ADMIN") || roles.includes("HR_ADMIN")) {
      return "HR_ADMIN";
    }
    if (roles.includes("EXECUTIVE")) {
      return "EXECUTIVE";
    }
    if (roles.includes("TEAM_LEAD") || roles.includes("MANAGER")) {
      return "TEAM_LEAD";
    }
    return "EMPLOYEE";
  }, [session, defaultRole]);

  // 역할에 맞는 기본 레이아웃
  const defaultLayout = roleWidgetConfigs[userRole];
  
  const {
    isEditing,
    setIsEditing,
    visibleWidgets,
    hiddenWidgets,
    toggleWidget,
  } = useWidgetLayout(defaultLayout);

  return (
    <WidgetGrid
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(!isEditing)}
    >
      {visibleWidgets.map((widget) => {
        const WidgetComponent = widgetComponents[widget.type];
        
        if (!WidgetComponent) {
          return null;
        }

        return (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            size={widget.size}
            isEditing={isEditing}
            onRemove={() => toggleWidget(widget.id)}
          >
            <WidgetComponent isCompact={widget.size === "small"} />
          </DraggableWidget>
        );
      })}

      {/* 편집 모드에서 위젯 추가 버튼 */}
      {isEditing && (
        <AddWidgetButton
          availableWidgets={hiddenWidgets}
          onAdd={(widgetId) => toggleWidget(widgetId)}
        />
      )}
    </WidgetGrid>
  );
}

// ==========================================
// 개별 위젯 컴포넌트들
// ==========================================

function AttendanceWidget({ isCompact }: { isCompact?: boolean }) {
  // Mock 데이터
  const attendance = {
    checkIn: "09:02",
    checkOut: null,
    workHours: "5시간 32분",
    status: "근무중",
  };

  if (isCompact) {
    return (
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">{attendance.workHours}</p>
        <Badge variant="success" className="mt-2">{attendance.status}</Badge>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-green-50 rounded-xl">
        <p className="text-xs text-gray-500">출근</p>
        <p className="text-lg font-bold text-green-600">{attendance.checkIn}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500">퇴근</p>
        <p className="text-lg font-bold text-gray-400">{attendance.checkOut || "--:--"}</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-xl">
        <p className="text-xs text-gray-500">근무 시간</p>
        <p className="text-lg font-bold text-blue-600">{attendance.workHours}</p>
      </div>
      <div className="p-3 bg-purple-50 rounded-xl">
        <p className="text-xs text-gray-500">상태</p>
        <Badge variant="success">{attendance.status}</Badge>
      </div>
    </div>
  );
}

function LeaveWidget({ isCompact }: { isCompact?: boolean }) {
  const leave = { total: 15, used: 8, remaining: 7 };
  const percentage = (leave.used / leave.total) * 100;

  return (
    <div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-bold text-blue-600">{leave.remaining}</span>
        <span className="text-gray-500 pb-1">일 남음</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!isCompact && (
        <p className="text-sm text-gray-500 mt-2">
          {leave.used}일 사용 / 총 {leave.total}일
        </p>
      )}
    </div>
  );
}

function SalaryWidget({ isCompact }: { isCompact?: boolean }) {
  return (
    <div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">₩4,850,000</span>
      </div>
      {!isCompact && (
        <p className="text-sm text-gray-500">지급 예정일: 2024년 1월 25일</p>
      )}
    </div>
  );
}

function PendingApprovalWidget({ isCompact }: { isCompact?: boolean }) {
  const items = [
    { id: 1, type: "휴가 신청", title: "연차 휴가" },
    { id: 2, type: "경비 청구", title: "출장 교통비" },
  ];

  return (
    <div className="space-y-2">
      {items.slice(0, isCompact ? 2 : 5).map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg"
        >
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            {!isCompact && <p className="text-xs text-gray-500">{item.type}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EvaluationWidget({ isCompact }: { isCompact?: boolean }) {
  return (
    <div>
      <Badge variant="warning" className="mb-2">자기평가 진행중</Badge>
      {!isCompact && <p className="text-sm text-gray-500">마감일: 2024년 1월 31일</p>}
    </div>
  );
}

function ApprovalQueueWidget({ isCompact }: { isCompact?: boolean }) {
  const items = [
    { id: 1, type: "휴가", name: "김철수", status: "pending" },
    { id: 2, type: "경비", name: "이영희", status: "pending" },
    { id: 3, type: "출장", name: "박민수", status: "pending" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="warning">{items.length}건 대기</Badge>
        <button className="text-sm text-blue-600 hover:underline">전체 보기</button>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.type} 신청</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200">
              승인
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
              반려
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamAttendanceWidget({ isCompact }: { isCompact?: boolean }) {
  const stats = { present: 12, late: 2, absent: 1, total: 15 };

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 bg-green-50 rounded-xl">
        <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        <p className="text-xs text-gray-500">출근</p>
      </div>
      <div className="text-center p-3 bg-orange-50 rounded-xl">
        <Clock className="w-6 h-6 mx-auto mb-1 text-orange-500" />
        <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
        <p className="text-xs text-gray-500">지각</p>
      </div>
      <div className="text-center p-3 bg-red-50 rounded-xl">
        <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-500" />
        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        <p className="text-xs text-gray-500">결근</p>
      </div>
    </div>
  );
}

function TeamLeaveWidget({ isCompact }: { isCompact?: boolean }) {
  const leaves = [
    { name: "김철수", type: "연차", dates: "1/15 ~ 1/17" },
    { name: "이영희", type: "반차", dates: "1/16 오후" },
  ];

  return (
    <div className="space-y-2">
      {leaves.map((leave, i) => (
        <div key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{leave.name}</span>
          </div>
          <span className="text-sm text-gray-500">{leave.dates}</span>
        </div>
      ))}
    </div>
  );
}

function HRSummaryWidget({ isCompact }: { isCompact?: boolean }) {
  const stats = [
    { label: "전체 직원", value: "1,247", icon: Users, trend: "+12" },
    { label: "이번 달 입사", value: "23", icon: CheckCircle2, trend: "+8" },
    { label: "대기 결재", value: "45", icon: FileCheck, trend: "-5" },
    { label: "출근율", value: "94.2%", icon: Clock, trend: "+1.2%" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <stat.icon className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-green-500">{stat.trend}</span>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function PendingAllWidget({ isCompact }: { isCompact?: boolean }) {
  return <PendingApprovalWidget isCompact={isCompact} />;
}

function OnboardingWidget({ isCompact }: { isCompact?: boolean }) {
  const items = [
    { name: "김신입", date: "2024-01-15", progress: 60 },
    { name: "박입사", date: "2024-01-10", progress: 80 },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-3 bg-green-50 rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="font-medium">{item.name}</span>
            <span className="text-sm text-gray-500">{item.date}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <p className="text-xs text-right text-gray-500 mt-1">{item.progress}% 완료</p>
        </div>
      ))}
    </div>
  );
}

function OffboardingWidget({ isCompact }: { isCompact?: boolean }) {
  const items = [
    { name: "이퇴사", lastDay: "2024-01-31" },
  ];

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
          <span className="font-medium">{item.name}</span>
          <span className="text-sm text-red-600">퇴사일: {item.lastDay}</span>
        </div>
      ))}
    </div>
  );
}

function KPISummaryWidget({ isCompact }: { isCompact?: boolean }) {
  const kpis = [
    { label: "인원", value: "1,247명", change: "+2.1%", positive: true },
    { label: "인건비", value: "52.3억", change: "+3.5%", positive: false },
    { label: "이직률", value: "4.2%", change: "-0.8%", positive: true },
    { label: "생산성", value: "₩185M", change: "+5.2%", positive: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
          <p className="text-2xl font-bold">{kpi.value}</p>
          <p className={`text-sm ${kpi.positive ? "text-green-600" : "text-red-600"}`}>
            {kpi.change}
          </p>
        </div>
      ))}
    </div>
  );
}

function HeadcountChartWidget({ isCompact }: { isCompact?: boolean }) {
  // 실제로는 차트 라이브러리 사용
  return (
    <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl">
      <div className="text-center text-gray-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
        <p>인원 추이 차트</p>
        <p className="text-xs">(차트 라이브러리 필요)</p>
      </div>
    </div>
  );
}

function TurnoverWidget({ isCompact }: { isCompact?: boolean }) {
  return (
    <div className="text-center">
      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
      <p className="text-3xl font-bold">4.2%</p>
      <p className="text-sm text-gray-500">전년 대비 -0.8%</p>
    </div>
  );
}

function CostSummaryWidget({ isCompact }: { isCompact?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">월 인건비</span>
      </div>
      <p className="text-2xl font-bold">₩52.3억</p>
      <p className="text-sm text-gray-500 mt-1">전월 대비 +2.1%</p>
    </div>
  );
}

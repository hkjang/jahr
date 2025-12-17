// 실시간 대시보드 및 비교 분석 서비스
// Phase 5.2-5.3: 실시간 KPI, 기간별/조직별 비교

import { prisma } from "./prisma";
import { subMonths, subYears, format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ko } from "date-fns/locale";

// ========================================
// 타입 정의
// ========================================

export interface KPIData {
  name: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend: "up" | "down" | "stable";
  unit?: string;
}

export interface DashboardData {
  kpis: KPIData[];
  charts: ChartData[];
  alerts: AlertData[];
  lastUpdated: Date;
}

export interface ChartData {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "area";
  data: Array<{ label: string; value: number; [key: string]: unknown }>;
}

export interface AlertData {
  id: string;
  type: "info" | "warning" | "error";
  message: string;
  link?: string;
}

export interface ComparisonResult {
  dimension: string;
  current: { label: string; data: Record<string, number> };
  previous: { label: string; data: Record<string, number> };
  changes: Record<string, { absolute: number; percent: number }>;
}

// ========================================
// 실시간 대시보드 서비스
// ========================================

export class RealtimeDashboardService {
  /**
   * HR 핵심 KPI 조회
   */
  static async getHRKPIs(): Promise<KPIData[]> {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const currentYear = now.getFullYear();

    // 총 직원 수
    const [currentEmployees, lastMonthEmployees] = await Promise.all([
      prisma.employee.count({ where: { user: { status: "ACTIVE" } } }),
      prisma.employee.count({
        where: {
          user: { status: "ACTIVE" },
          hireDate: { lte: lastMonth },
        },
      }),
    ]);

    // 이번 달 입사자
    const thisMonthStart = startOfMonth(now);
    const newHiresThisMonth = await prisma.employee.count({
      where: {
        hireDate: { gte: thisMonthStart },
      },
    });

    // 평균 출근율 (이번 달)
    const attendanceStats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: { gte: thisMonthStart },
      },
      _count: { _all: true },
    });

    const totalAttendance = attendanceStats.reduce((sum: number, s: { _count: { _all: number } }) => sum + s._count._all, 0);
    const normalCount = attendanceStats.find((s: { status: string }) => s.status === "NORMAL")?._count._all || 0;
    const attendanceRate = totalAttendance > 0 ? (normalCount / totalAttendance) * 100 : 0;

    // 연차 소진율
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        year: currentYear,
        leaveType: "ANNUAL",
      },
    });

    const avgLeaveUsage = leaveBalances.length > 0
      ? leaveBalances.reduce((sum: number, lb: { usedDays: number; totalDays: number }) => sum + (lb.usedDays / lb.totalDays), 0) / leaveBalances.length * 100
      : 0;

    // 대기 중인 결재
    const pendingApprovals = await prisma.leave.count({
      where: { status: "PENDING" },
    });

    return [
      {
        name: "총 직원 수",
        value: currentEmployees,
        previousValue: lastMonthEmployees,
        changePercent: lastMonthEmployees > 0 
          ? ((currentEmployees - lastMonthEmployees) / lastMonthEmployees) * 100 
          : 0,
        trend: currentEmployees >= lastMonthEmployees ? "up" : "down",
        unit: "명",
      },
      {
        name: "이번 달 입사",
        value: newHiresThisMonth,
        trend: "stable",
        unit: "명",
      },
      {
        name: "평균 출근율",
        value: Math.round(attendanceRate * 10) / 10,
        trend: attendanceRate >= 95 ? "up" : attendanceRate < 90 ? "down" : "stable",
        unit: "%",
      },
      {
        name: "연차 소진율",
        value: Math.round(avgLeaveUsage * 10) / 10,
        trend: avgLeaveUsage >= 50 ? "up" : "down",
        unit: "%",
      },
      {
        name: "대기 결재",
        value: pendingApprovals,
        trend: pendingApprovals > 10 ? "down" : "stable",
        unit: "건",
      },
    ];
  }

  /**
   * 대시보드 전체 데이터 조회
   */
  static async getDashboardData(): Promise<DashboardData> {
    const [kpis, monthlyTrend, departmentStats, alerts] = await Promise.all([
      this.getHRKPIs(),
      this.getMonthlyTrend(),
      this.getDepartmentStats(),
      this.getAlerts(),
    ]);

    return {
      kpis,
      charts: [
        {
          id: "monthly-trend",
          title: "월별 인원 추이",
          type: "line",
          data: monthlyTrend,
        },
        {
          id: "department-stats",
          title: "부서별 인원 현황",
          type: "bar",
          data: departmentStats,
        },
      ],
      alerts,
      lastUpdated: new Date(),
    };
  }

  /**
   * 월별 인원 추이
   */
  private static async getMonthlyTrend(): Promise<ChartData["data"]> {
    const months: ChartData["data"] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      const monthEnd = endOfMonth(targetMonth);
      
      const count = await prisma.employee.count({
        where: {
          hireDate: { lte: monthEnd },
          OR: [
            { user: { status: "ACTIVE" } },
            { user: { status: "INACTIVE" } },
          ],
        },
      });

      months.push({
        label: format(targetMonth, "M월", { locale: ko }),
        value: count,
      });
    }

    return months;
  }

  /**
   * 부서별 인원 현황
   */
  private static async getDepartmentStats(): Promise<ChartData["data"]> {
    const departments = await prisma.organization.findMany({
      where: { parentId: null },
      include: {
        _count: {
          select: {
            employees: {
              where: { user: { status: "ACTIVE" } },
            },
          },
        },
      },
    });

    return departments.map((dept: { name: string; _count: { employees: number } }) => ({
      label: dept.name,
      value: dept._count.employees,
    }));
  }

  /**
   * 알림 생성
   */
  private static async getAlerts(): Promise<AlertData[]> {
    const alerts: AlertData[] = [];
    const now = new Date();

    // 대기 결재 알림
    const pendingLeaves = await prisma.leave.count({
      where: { status: "PENDING" },
    });

    if (pendingLeaves > 5) {
      alerts.push({
        id: "pending-leaves",
        type: "warning",
        message: `처리 대기 중인 휴가 신청이 ${pendingLeaves}건 있습니다.`,
        link: "/admin/leave",
      });
    }

    // 오늘 만료 세션 정리 필요 알림
    const expiredSessions = await prisma.session.count({
      where: { expiresAt: { lt: now } },
    });

    if (expiredSessions > 100) {
      alerts.push({
        id: "expired-sessions",
        type: "info",
        message: `만료된 세션 ${expiredSessions}개 정리가 필요합니다.`,
      });
    }

    return alerts;
  }
}

// ========================================
// 비교 분석 서비스
// ========================================

export class ComparisonAnalysisService {
  /**
   * 기간별 비교 분석
   */
  static async comparePeriods(
    periodType: "month" | "quarter" | "year",
    currentStart: Date,
    previousStart: Date
  ): Promise<ComparisonResult> {
    const currentEnd = periodType === "year" 
      ? endOfYear(currentStart) 
      : endOfMonth(currentStart);
    const previousEnd = periodType === "year"
      ? endOfYear(previousStart)
      : endOfMonth(previousStart);

    const [currentData, previousData] = await Promise.all([
      this.getPeriodMetrics(currentStart, currentEnd),
      this.getPeriodMetrics(previousStart, previousEnd),
    ]);

    const changes: Record<string, { absolute: number; percent: number }> = {};
    for (const key of Object.keys(currentData)) {
      const current = currentData[key] || 0;
      const previous = previousData[key] || 0;
      changes[key] = {
        absolute: current - previous,
        percent: previous > 0 ? ((current - previous) / previous) * 100 : 0,
      };
    }

    return {
      dimension: "period",
      current: {
        label: format(currentStart, "yyyy-MM", { locale: ko }),
        data: currentData,
      },
      previous: {
        label: format(previousStart, "yyyy-MM", { locale: ko }),
        data: previousData,
      },
      changes,
    };
  }

  /**
   * 조직별 비교 분석
   */
  static async compareOrganizations(
    orgIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<ComparisonResult[]> {
    const results: ComparisonResult[] = [];

    for (let i = 0; i < orgIds.length - 1; i++) {
      const currentOrg = await prisma.organization.findUnique({
        where: { id: orgIds[i] },
      });
      const previousOrg = await prisma.organization.findUnique({
        where: { id: orgIds[i + 1] },
      });

      if (!currentOrg || !previousOrg) continue;

      const [currentData, previousData] = await Promise.all([
        this.getOrganizationMetrics(orgIds[i], startDate, endDate),
        this.getOrganizationMetrics(orgIds[i + 1], startDate, endDate),
      ]);

      const changes: Record<string, { absolute: number; percent: number }> = {};
      for (const key of Object.keys(currentData)) {
        const current = currentData[key] || 0;
        const previous = previousData[key] || 0;
        changes[key] = {
          absolute: current - previous,
          percent: previous > 0 ? ((current - previous) / previous) * 100 : 0,
        };
      }

      results.push({
        dimension: "organization",
        current: { label: currentOrg.name, data: currentData },
        previous: { label: previousOrg.name, data: previousData },
        changes,
      });
    }

    return results;
  }

  /**
   * 기간별 지표 수집
   */
  private static async getPeriodMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, number>> {
    const [
      newHires,
      resignations,
      totalLeaves,
      trainingCount,
    ] = await Promise.all([
      prisma.employee.count({
        where: {
          hireDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.appointment.count({
        where: {
          type: { in: ["RESIGNATION", "RETIREMENT"] },
          effectiveDate: { gte: startDate, lte: endDate },
        },
      }),
      prisma.leave.count({
        where: {
          startDate: { gte: startDate, lte: endDate },
          status: "APPROVED",
        },
      }),
      prisma.evaluation.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      newHires,
      resignations,
      turnoverRate: newHires > 0 ? (resignations / newHires) * 100 : 0,
      totalLeaves,
      evaluations: trainingCount,
    };
  }

  /**
   * 조직별 지표 수집
   */
  private static async getOrganizationMetrics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, number>> {
    const [
      employeeCount,
      avgAttendance,
      leaveUsage,
    ] = await Promise.all([
      prisma.employee.count({
        where: {
          organizationId,
          user: { status: "ACTIVE" },
        },
      }),
      this.getOrgAttendanceRate(organizationId, startDate, endDate),
      this.getOrgLeaveUsage(organizationId),
    ]);

    return {
      employeeCount,
      attendanceRate: avgAttendance,
      leaveUsageRate: leaveUsage,
    };
  }

  private static async getOrgAttendanceRate(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const stats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        employee: { organizationId },
        date: { gte: startDate, lte: endDate },
      },
      _count: { _all: true },
    });

    const total = stats.reduce((sum: number, s: { _count: { _all: number } }) => sum + s._count._all, 0);
    const normal = stats.find((s: { status: string }) => s.status === "NORMAL")?._count._all || 0;
    return total > 0 ? (normal / total) * 100 : 0;
  }

  private static async getOrgLeaveUsage(organizationId: string): Promise<number> {
    const balances = await prisma.leaveBalance.findMany({
      where: {
        employee: { organizationId },
        year: new Date().getFullYear(),
        leaveType: "ANNUAL",
      },
    });

    if (balances.length === 0) return 0;
    return balances.reduce((sum: number, lb: { usedDays: number; totalDays: number }) => sum + (lb.usedDays / lb.totalDays), 0) / balances.length * 100;
  }
}

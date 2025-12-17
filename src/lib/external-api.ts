// 외부 BI 연동 API 서비스
// Phase 5.5: 외부 시스템 연동용 API

import { prisma } from "./prisma";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

// ========================================
// 타입 정의
// ========================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    generatedAt: string;
  };
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
}

// API 데이터 스키마
export interface EmployeeAPIData {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hireDate: string;
  status: string;
}

export interface AttendanceAPIData {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workMinutes: number;
  status: string;
}

export interface LeaveAPIData {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

export interface HRMetricsAPIData {
  period: string;
  totalEmployees: number;
  newHires: number;
  resignations: number;
  turnoverRate: number;
  attendanceRate: number;
  leaveUsageRate: number;
}

// ========================================
// 외부 API 서비스
// ========================================

export class ExternalAPIService {
  // 인메모리 API 키 저장소 (실제로는 DB 테이블 사용)
  private static apiKeys = new Map<string, APIKey>();

  /**
   * API 키 검증
   */
  static validateAPIKey(apiKey: string): APIKey | null {
    const key = this.apiKeys.get(apiKey);
    if (!key) return null;
    if (key.expiresAt && key.expiresAt < new Date()) return null;
    
    // 마지막 사용 시간 업데이트
    key.lastUsedAt = new Date();
    return key;
  }

  /**
   * API 키 생성
   */
  static createAPIKey(name: string, permissions: string[], expiryDays?: number): APIKey {
    const key = `jhr_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
    const apiKey: APIKey = {
      id: key.slice(4, 20),
      name,
      key,
      permissions,
      createdAt: new Date(),
      expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
    };
    
    this.apiKeys.set(key, apiKey);
    return apiKey;
  }

  /**
   * 직원 목록 API
   */
  static async getEmployees(
    page: number = 1,
    pageSize: number = 50,
    filters?: { department?: string; status?: string }
  ): Promise<APIResponse<EmployeeAPIData[]>> {
    try {
      const where: Record<string, unknown> = {};
      
      if (filters?.department) {
        where.organization = { name: { contains: filters.department } };
      }
      if (filters?.status) {
        where.user = { status: filters.status };
      }

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            user: { select: { name: true, email: true, status: true } },
            organization: { select: { name: true } },
            position: { select: { name: true } },
          },
        }),
        prisma.employee.count({ where }),
      ]);

      const data: EmployeeAPIData[] = employees.map((e: unknown) => {
        const emp = e as {
          id: string;
          employeeId?: string;
          user: { name: string; email: string; status: string };
          organization: { name: string } | null;
          position: { name: string } | null;
          hireDate: Date;
        };
        return {
          id: emp.id,
          employeeId: emp.employeeId || emp.id,
          name: emp.user.name,
          email: emp.user.email,
          department: emp.organization?.name || "",
          position: emp.position?.name || "",
          hireDate: format(emp.hireDate, "yyyy-MM-dd"),
          status: emp.user.status,
        };
      });

      return {
        success: true,
        data,
        meta: {
          total,
          page,
          pageSize,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "직원 조회 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 근태 데이터 API
   */
  static async getAttendance(
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<APIResponse<AttendanceAPIData[]>> {
    try {
      const where: Record<string, unknown> = {
        date: { gte: startDate, lte: endDate },
      };
      
      if (employeeId) {
        where.employeeId = employeeId;
      }

      const attendances = await prisma.attendance.findMany({
        where,
        include: {
          employee: { select: { id: true } },
        },
        orderBy: { date: "desc" },
      });

      const data: AttendanceAPIData[] = attendances.map((a: unknown) => {
        const att = a as {
          id: string;
          employee: { employeeId?: string; id?: string };
          date: Date;
          checkIn: Date | null;
          checkOut: Date | null;
          workMinutes: number | null;
          status: string;
        };
        return {
          id: att.id,
          employeeId: att.employee.employeeId || att.employee.id || "",
          date: format(att.date, "yyyy-MM-dd"),
          checkIn: att.checkIn ? format(att.checkIn, "HH:mm") : undefined,
          checkOut: att.checkOut ? format(att.checkOut, "HH:mm") : undefined,
          workMinutes: att.workMinutes || 0,
          status: att.status,
        };
      });

      return {
        success: true,
        data,
        meta: {
          total: data.length,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "근태 조회 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 휴가 데이터 API
   */
  static async getLeaves(
    startDate: Date,
    endDate: Date,
    status?: string
  ): Promise<APIResponse<LeaveAPIData[]>> {
    try {
      const where: Record<string, unknown> = {
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      };
      
      if (status) {
        where.status = status;
      }

      const leaves = await prisma.leave.findMany({
        where,
        include: {
          employee: { select: { id: true } },
        },
        orderBy: { startDate: "desc" },
      });

      const data: LeaveAPIData[] = leaves.map((l: unknown) => {
        const lv = l as {
          id: string;
          employee: { employeeId?: string; id?: string };
          leaveType: string;
          startDate: Date;
          endDate: Date;
          days: number;
          status: string;
        };
        return {
          id: lv.id,
          employeeId: lv.employee.employeeId || lv.employee.id || "",
          type: lv.leaveType,
          startDate: format(lv.startDate, "yyyy-MM-dd"),
          endDate: format(lv.endDate, "yyyy-MM-dd"),
          days: lv.days,
          status: lv.status,
        };
      });

      return {
        success: true,
        data,
        meta: {
          total: data.length,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "휴가 조회 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * HR 지표 API
   */
  static async getHRMetrics(
    months: number = 6
  ): Promise<APIResponse<HRMetricsAPIData[]>> {
    try {
      const data: HRMetricsAPIData[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const targetMonth = subMonths(now, i);
        const monthStart = startOfMonth(targetMonth);
        const monthEnd = endOfMonth(targetMonth);

        // 총 직원 수
        const totalEmployees = await prisma.employee.count({
          where: {
            hireDate: { lte: monthEnd },
            user: { status: "ACTIVE" },
          },
        });

        // 신규 입사
        const newHires = await prisma.employee.count({
          where: {
            hireDate: { gte: monthStart, lte: monthEnd },
          },
        });

        // 퇴사
        const resignations = await prisma.appointment.count({
          where: {
            type: { in: ["RESIGNATION", "RETIREMENT"] },
            effectiveDate: { gte: monthStart, lte: monthEnd },
          },
        });

        // 출근율
        const attendanceStats = await prisma.attendance.groupBy({
          by: ["status"],
          where: {
            date: { gte: monthStart, lte: monthEnd },
          },
          _count: { _all: true },
        });

        const totalAttendance = attendanceStats.reduce((sum: number, s: { _count: { _all: number } }) => sum + s._count._all, 0);
        const normalCount = attendanceStats.find((s: { status: string }) => s.status === "NORMAL")?._count._all || 0;
        const attendanceRate = totalAttendance > 0 ? (normalCount / totalAttendance) * 100 : 0;

        // 연차 사용률
        const leaveBalances = await prisma.leaveBalance.findMany({
          where: {
            year: targetMonth.getFullYear(),
            leaveType: "ANNUAL",
          },
        });

        const leaveUsageRate = leaveBalances.length > 0
          ? leaveBalances.reduce((sum: number, lb: { usedDays: number; totalDays: number }) => sum + (lb.usedDays / lb.totalDays), 0) / leaveBalances.length * 100
          : 0;

        data.push({
          period: format(targetMonth, "yyyy-MM"),
          totalEmployees,
          newHires,
          resignations,
          turnoverRate: totalEmployees > 0 ? (resignations / totalEmployees) * 100 : 0,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
          leaveUsageRate: Math.round(leaveUsageRate * 10) / 10,
        });
      }

      return {
        success: true,
        data,
        meta: {
          total: data.length,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "HR 지표 조회 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 데이터 스냅샷 생성 (BI 도구용)
   */
  static async createDataSnapshot(): Promise<APIResponse<{
    employees: number;
    attendance: number;
    leaves: number;
    snapshotId: string;
  }>> {
    const snapshotId = `snapshot_${format(new Date(), "yyyyMMdd_HHmmss")}`;
    
    const [employees, attendance, leaves] = await Promise.all([
      prisma.employee.count(),
      prisma.attendance.count(),
      prisma.leave.count(),
    ]);

    console.log(`[DataSnapshot] Created: ${snapshotId}`);

    return {
      success: true,
      data: {
        employees,
        attendance,
        leaves,
        snapshotId,
      },
      meta: {
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

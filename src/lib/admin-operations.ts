// 관리자 운영 유틸리티
// Phase 7: 정책 시뮬레이션, 설정 버전 관리, 배치 처리, 기능 토글, 모니터링

import { prisma } from "./prisma";
import { format } from "date-fns";

// ========================================
// 타입 정의
// ========================================

export interface PolicySimulationResult {
  policyType: string;
  currentValue: unknown;
  newValue: unknown;
  affectedEmployees: number;
  impactSummary: string[];
  estimatedCostChange?: number;
}

export interface SettingVersion {
  id: string;
  key: string;
  value: unknown;
  previousValue: unknown;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

export interface BatchJob {
  id: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt?: Date;
  completedAt?: Date;
  errors?: string[];
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  enabledForRoles?: string[];
  enabledPercentage?: number;
}

export interface SystemHealth {
  database: HealthStatus;
  api: HealthStatus;
  cache: HealthStatus;
  memory: HealthStatus;
  uptime: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  responseTime?: number;
  message?: string;
}

// ========================================
// 정책 시뮬레이션 서비스
// ========================================

export class PolicySimulationService {
  /**
   * 연차 정책 변경 시뮬레이션
   */
  static async simulateLeavePolicy(
    newBaseAnnualLeave: number,
    newCarryoverLimit: number
  ): Promise<PolicySimulationResult> {
    // 현재 정책 조회 (시스템 설정에서)
    const currentBaseLeave = 15; // 실제로는 DB에서 조회
    const currentCarryover = 0;

    // 영향 받는 직원 수
    const activeEmployees = await prisma.employee.count({
      where: { user: { status: "ACTIVE" } },
    });

    // 현재 연차 잔여 현황
    const currentYear = new Date().getFullYear();
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        year: currentYear,
        leaveType: "ANNUAL",
      },
    });

    const impactSummary: string[] = [];
    let costChange = 0;

    // 기본 연차 변경 영향
    const leaveDiff = newBaseAnnualLeave - currentBaseLeave;
    if (leaveDiff > 0) {
      impactSummary.push(`기본 연차 ${leaveDiff}일 증가`);
      costChange = leaveDiff * activeEmployees * 200000; // 일당 약 20만원 가정
    } else if (leaveDiff < 0) {
      impactSummary.push(`기본 연차 ${Math.abs(leaveDiff)}일 감소`);
      costChange = leaveDiff * activeEmployees * 200000;
    }

    // 이월 정책 변경 영향
    if (newCarryoverLimit !== currentCarryover) {
      const affectedByCarryover = leaveBalances.filter(
        (lb) => lb.totalDays - lb.usedDays > newCarryoverLimit
      ).length;
      impactSummary.push(`이월 한도 변경으로 ${affectedByCarryover}명 영향`);
    }

    return {
      policyType: "LeavePolicy",
      currentValue: { baseAnnualLeave: currentBaseLeave, carryoverLimit: currentCarryover },
      newValue: { baseAnnualLeave: newBaseAnnualLeave, carryoverLimit: newCarryoverLimit },
      affectedEmployees: activeEmployees,
      impactSummary,
      estimatedCostChange: costChange,
    };
  }

  /**
   * 급여 정책 변경 시뮬레이션
   */
  static async simulateSalaryPolicy(
    percentageChange: number
  ): Promise<PolicySimulationResult> {
    const activeEmployees = await prisma.employee.count({
      where: { user: { status: "ACTIVE" } },
    });

    // 현재 총 급여 비용 (간이 계산)
    const salaries = await prisma.salary.findMany({
      where: {
        yearMonth: format(new Date(), "yyyy-MM"),
      },
      select: { baseSalary: true },
    });

    const totalCurrentSalary = salaries.reduce(
      (sum, s) => sum + Number(s.baseSalary),
      0
    );
    const estimatedChange = totalCurrentSalary * (percentageChange / 100);

    return {
      policyType: "SalaryPolicy",
      currentValue: { averageChange: 0 },
      newValue: { averageChange: percentageChange },
      affectedEmployees: salaries.length,
      impactSummary: [
        `${percentageChange > 0 ? "인상" : "감소"} ${Math.abs(percentageChange)}%`,
        `예상 월 비용 변화: ${estimatedChange.toLocaleString()}원`,
      ],
      estimatedCostChange: estimatedChange * 12, // 연간
    };
  }
}

// ========================================
// 설정 버전 관리 서비스
// ========================================

export class SettingVersionService {
  // 인메모리 버전 히스토리
  private static history: SettingVersion[] = [];

  /**
   * 설정 변경 기록
   */
  static recordChange(
    key: string,
    previousValue: unknown,
    newValue: unknown,
    changedBy: string,
    reason?: string
  ): SettingVersion {
    const version: SettingVersion = {
      id: `sv_${Date.now()}`,
      key,
      value: newValue,
      previousValue,
      changedBy,
      changedAt: new Date(),
      reason,
    };

    this.history.unshift(version);
    return version;
  }

  /**
   * 설정 이력 조회
   */
  static getHistory(key?: string, limit: number = 50): SettingVersion[] {
    let filtered = this.history;
    if (key) {
      filtered = filtered.filter((v) => v.key === key);
    }
    return filtered.slice(0, limit);
  }

  /**
   * 특정 버전으로 롤백
   */
  static async rollback(versionId: string): Promise<SettingVersion | null> {
    const version = this.history.find((v) => v.id === versionId);
    if (!version) return null;

    // 롤백 기록
    const rollbackVersion = this.recordChange(
      version.key,
      version.value,
      version.previousValue,
      "SYSTEM",
      `Rollback to version ${versionId}`
    );

    return rollbackVersion;
  }
}

// ========================================
// 배치 처리 서비스
// ========================================

export class BatchProcessingService {
  private static jobs = new Map<string, BatchJob>();

  /**
   * 배치 작업 생성
   */
  static createJob(type: string, totalItems: number): BatchJob {
    const job: BatchJob = {
      id: `batch_${Date.now()}`,
      type,
      status: "pending",
      totalItems,
      processedItems: 0,
      failedItems: 0,
      errors: [],
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * 대량 직원 정보 업데이트
   */
  static async bulkUpdateEmployees(
    updates: Array<{ id: string; data: Record<string, unknown> }>
  ): Promise<BatchJob> {
    const job = this.createJob("BULK_UPDATE_EMPLOYEES", updates.length);
    job.status = "running";
    job.startedAt = new Date();

    for (const update of updates) {
      try {
        await prisma.employee.update({
          where: { id: update.id },
          data: update.data as never,
        });
        job.processedItems++;
      } catch (error) {
        job.failedItems++;
        job.errors?.push(`${update.id}: ${String(error)}`);
      }
    }

    job.status = job.failedItems === 0 ? "completed" : "failed";
    job.completedAt = new Date();
    return job;
  }

  /**
   * 대량 연차 부여
   */
  static async bulkGrantLeave(
    employeeIds: string[],
    days: number,
    leaveType: string = "ANNUAL"
  ): Promise<BatchJob> {
    const job = this.createJob("BULK_GRANT_LEAVE", employeeIds.length);
    job.status = "running";
    job.startedAt = new Date();

    const currentYear = new Date().getFullYear();

    for (const employeeId of employeeIds) {
      try {
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_year_leaveType: {
              employeeId,
              year: currentYear,
              leaveType: leaveType as never,
            },
          },
          update: {
            totalDays: { increment: days },
          },
          create: {
            employeeId,
            year: currentYear,
            leaveType: leaveType as never,
            totalDays: days,
            usedDays: 0,
          },
        });
        job.processedItems++;
      } catch (error) {
        job.failedItems++;
        job.errors?.push(`${employeeId}: ${String(error)}`);
      }
    }

    job.status = job.failedItems === 0 ? "completed" : "failed";
    job.completedAt = new Date();
    return job;
  }

  /**
   * 작업 상태 조회
   */
  static getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * 최근 작업 목록
   */
  static getRecentJobs(limit: number = 10): BatchJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => {
        const aTime = a.startedAt?.getTime() || 0;
        const bTime = b.startedAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
  }
}

// ========================================
// 기능 플래그 서비스
// ========================================

export class FeatureFlagService {
  private static flags = new Map<string, FeatureFlag>([
    ["ai_predictions", { key: "ai_predictions", enabled: true, description: "AI 기반 이탈 예측 기능" }],
    ["hr_chatbot", { key: "hr_chatbot", enabled: true, description: "HR 챗봇 기능" }],
    ["realtime_dashboard", { key: "realtime_dashboard", enabled: true, description: "실시간 대시보드" }],
    ["external_api", { key: "external_api", enabled: false, description: "외부 BI API" }],
    ["multi_tenant", { key: "multi_tenant", enabled: false, description: "멀티 테넌트 지원" }],
  ]);

  /**
   * 기능 활성화 여부 확인
   */
  static isEnabled(key: string, userRole?: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;
    if (!flag.enabled) return false;

    // 역할별 제한 확인
    if (flag.enabledForRoles && userRole) {
      return flag.enabledForRoles.includes(userRole);
    }

    // 점진적 롤아웃 (퍼센트 기반)
    if (flag.enabledPercentage !== undefined) {
      return Math.random() * 100 < flag.enabledPercentage;
    }

    return true;
  }

  /**
   * 기능 토글
   */
  static toggle(key: string, enabled: boolean): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.enabled = enabled;
    }
  }

  /**
   * 모든 기능 플래그 조회
   */
  static getAll(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * 기능 플래그 업데이트
   */
  static update(key: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(key);
    if (flag) {
      Object.assign(flag, updates);
    }
  }
}

// ========================================
// 시스템 모니터링 서비스
// ========================================

export class SystemMonitoringService {
  private static startTime = Date.now();

  /**
   * 시스템 상태 조회
   */
  static async getHealth(): Promise<SystemHealth> {
    const [dbStatus, memoryStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkMemory(),
    ]);

    return {
      database: dbStatus,
      api: { status: "healthy", responseTime: 0 },
      cache: { status: "healthy" },
      memory: memoryStatus,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * 데이터베이스 상태 확인
   */
  private static async checkDatabase(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: "healthy",
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: String(error),
      };
    }
  }

  /**
   * 메모리 상태 확인
   */
  private static checkMemory(): HealthStatus {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    return {
      status: usagePercent > 90 ? "unhealthy" : usagePercent > 70 ? "degraded" : "healthy",
      message: `${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
    };
  }

  /**
   * 시스템 메트릭 조회
   */
  static async getMetrics(): Promise<Record<string, number>> {
    const [
      totalEmployees,
      activeUsers,
      pendingLeaves,
      todayAttendance,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.leave.count({ where: { status: "PENDING" } }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalEmployees,
      activeUsers,
      pendingLeaves,
      todayAttendance,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}

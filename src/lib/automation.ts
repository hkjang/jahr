// HR Automation Engine Core
// 입사/퇴사/발령 자동화 및 근태 이상 감지

import { prisma } from "./prisma";

// Prisma enum 타입 정의 (schema.prisma와 동기화)
type AutomationType = 
  | "ONBOARDING"
  | "OFFBOARDING"
  | "APPOINTMENT"
  | "ATTENDANCE_ALERT"
  | "NOTIFICATION"
  | "LEAVE_BALANCE"
  | "EVALUATION_CYCLE";

type AutomationStatus = 
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

// ========================================
// 타입 정의
// ========================================

export interface AutomationTrigger {
  event: string;
  conditions?: Array<{
    field: string;
    operator: "eq" | "ne" | "gt" | "lt" | "contains" | "in";
    value: unknown;
  }>;
}

export interface AutomationAction {
  type: string;
  params: Record<string, unknown>;
  order?: number;
}

export interface OnboardingActions {
  createAccount: boolean;
  assignOrganization: boolean;
  assignRole: boolean;
  createLeaveBalance: boolean;
  sendWelcomeEmail: boolean;
}

export interface OffboardingActions {
  deactivateAccount: boolean;
  revokeRoles: boolean;
  archiveData: boolean;
  sendExitEmail: boolean;
}

// ========================================
// 자동화 엔진 클래스
// ========================================

export class AutomationEngine {
  // 입사 자동화 실행
  static async executeOnboarding(
    employeeId: string,
    userId: string,
    options: Partial<OnboardingActions> = {}
  ) {
    const logId = await this.createLog("ONBOARDING", employeeId);

    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          user: true,
          organization: true,
          position: true,
        },
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      const results: Record<string, unknown> = {};

      // 1. 계정 활성화
      if (options.createAccount !== false) {
        await prisma.user.update({
          where: { id: employee.userId },
          data: { status: "ACTIVE" },
        });
        results.accountActivated = true;
      }

      // 2. 기본 역할 부여
      if (options.assignRole !== false) {
        const employeeRole = await prisma.role.findUnique({
          where: { code: "EMPLOYEE" },
        });

        if (employeeRole) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: employee.userId,
                roleId: employeeRole.id,
              },
            },
            update: {},
            create: {
              userId: employee.userId,
              roleId: employeeRole.id,
            },
          });
          results.roleAssigned = "EMPLOYEE";
        }
      }

      // 3. 연차 잔여일 생성
      if (options.createLeaveBalance !== false) {
        const currentYear = new Date().getFullYear();
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_year_leaveType: {
              employeeId,
              year: currentYear,
              leaveType: "ANNUAL",
            },
          },
          update: {},
          create: {
            employeeId,
            year: currentYear,
            leaveType: "ANNUAL",
            totalDays: 15, // 기본 연차
            usedDays: 0,
          },
        });
        results.leaveBalanceCreated = true;
      }

      // 4. 환영 알림 생성
      if (options.sendWelcomeEmail !== false) {
        await prisma.notification.create({
          data: {
            userId: employee.userId,
            title: "입사를 환영합니다!",
            message: `${employee.organization.name}에 오신 것을 환영합니다. 새로운 시작을 응원합니다!`,
            link: "/portal/dashboard",
          },
        });
        results.welcomeNotificationSent = true;
      }

      // 감사 로그
      await prisma.auditLog.create({
        data: {
          userId,
          action: "AUTOMATION",
          entityType: "Employee",
          entityId: employeeId,
          newValue: JSON.parse(JSON.stringify({ type: "ONBOARDING", results })),
        },
      });

      await this.updateLog(logId, "SUCCESS", results);
      return { success: true, results };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.updateLog(logId, "FAILED", null, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 퇴사 자동화 실행
  static async executeOffboarding(
    employeeId: string,
    userId: string,
    options: Partial<OffboardingActions> = {}
  ) {
    const logId = await this.createLog("OFFBOARDING", employeeId);

    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true },
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      const results: Record<string, unknown> = {};

      // 1. 계정 비활성화
      if (options.deactivateAccount !== false) {
        await prisma.user.update({
          where: { id: employee.userId },
          data: { status: "INACTIVE" },
        });
        results.accountDeactivated = true;
      }

      // 2. 모든 역할 회수
      if (options.revokeRoles !== false) {
        const deletedRoles = await prisma.userRole.deleteMany({
          where: { userId: employee.userId },
        });
        results.rolesRevoked = deletedRoles.count;
      }

      // 3. 활성 세션 삭제
      await prisma.session.deleteMany({
        where: { userId: employee.userId },
      });
      results.sessionsCleared = true;

      // 4. 대기 중인 결재 취소
      const cancelledApprovals = await prisma.approval.updateMany({
        where: {
          requesterId: employee.userId,
          status: "PENDING",
        },
        data: { status: "CANCELLED" },
      });
      results.approvalsCancelled = cancelledApprovals.count;

      // 감사 로그
      await prisma.auditLog.create({
        data: {
          userId,
          action: "AUTOMATION",
          entityType: "Employee",
          entityId: employeeId,
          newValue: JSON.parse(JSON.stringify({ type: "OFFBOARDING", results })),
        },
      });

      await this.updateLog(logId, "SUCCESS", results);
      return { success: true, results };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.updateLog(logId, "FAILED", null, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 인사 발령 자동 반영
  static async executeAppointment(appointmentId: string, userId: string) {
    const logId = await this.createLog("APPOINTMENT", null);

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { employee: true },
      });

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      const results: Record<string, unknown> = {};

      // 발령 유형별 처리
      switch (appointment.type) {
        case "TRANSFER":
        case "PROMOTION":
        case "DEMOTION":
          // 조직/직급 변경
          await prisma.employee.update({
            where: { id: appointment.employeeId },
            data: {
              ...(appointment.newOrgId && { organizationId: appointment.newOrgId }),
              ...(appointment.newPositionId && { positionId: appointment.newPositionId }),
            },
          });
          results.employeeUpdated = true;
          break;

        case "HIRE":
          // 입사 자동화 실행
          const onboardingResult = await this.executeOnboarding(
            appointment.employeeId,
            userId
          );
          results.onboarding = onboardingResult;
          break;

        case "RESIGNATION":
        case "RETIREMENT":
          // 퇴사 자동화 실행
          const offboardingResult = await this.executeOffboarding(
            appointment.employeeId,
            userId
          );
          results.offboarding = offboardingResult;
          break;
      }

      await this.updateLog(logId, "SUCCESS", results);
      return { success: true, results };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.updateLog(logId, "FAILED", null, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // 로그 생성
  private static async createLog(
    type: AutomationType,
    employeeId: string | null
  ): Promise<string> {
    // 기본 자동화 규칙 조회 또는 시스템 규칙 사용
    let rule = await prisma.automationRule.findFirst({
      where: { type, isActive: true },
    });

    if (!rule) {
      // 시스템 기본 규칙 생성
      rule = await prisma.automationRule.create({
        data: {
          name: `System ${type}`,
          type,
          trigger: { event: "SYSTEM_TRIGGER" },
          actions: [],
          createdBy: "SYSTEM",
        },
      });
    }

    const log = await prisma.automationLog.create({
      data: {
        ruleId: rule.id,
        employeeId,
        status: "RUNNING",
      },
    });

    return log.id;
  }

  // 로그 업데이트
  private static async updateLog(
    logId: string,
    status: AutomationStatus,
    result?: Record<string, unknown> | null,
    error?: string
  ) {
    await prisma.automationLog.update({
      where: { id: logId },
      data: {
        status,
        result: result ? JSON.parse(JSON.stringify(result)) : undefined,
        error,
        completedAt: new Date(),
      },
    });
  }
}

// ========================================
// 스케줄 기반 자동화 (발령일 기준)
// ========================================

export async function processScheduledAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 오늘 발령일인 승인된 발령 조회
  const appointments = await prisma.appointment.findMany({
    where: {
      effectiveDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      approval: {
        status: "APPROVED",
      },
    },
    include: {
      employee: { include: { user: true } },
    },
  });

  const results = [];

  for (const appointment of appointments) {
    const result = await AutomationEngine.executeAppointment(
      appointment.id,
      "SYSTEM"
    );
    results.push({
      appointmentId: appointment.id,
      employeeId: appointment.employeeId,
      type: appointment.type,
      ...result,
    });
  }

  return results;
}

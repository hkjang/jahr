// 근태 이상 감지 모니터
// 지각, 결근, 조퇴 등 자동 탐지

import { prisma } from "./prisma";
import { format, startOfDay, endOfDay, differenceInMinutes } from "date-fns";

// ========================================
// 타입 정의
// ========================================

export type AttendanceAlertType =
  | "LATE"           // 지각
  | "ABSENT"         // 결근
  | "EARLY_LEAVE"    // 조퇴
  | "NO_CHECKOUT"    // 퇴근 미체크
  | "OVERTIME_EXCESS" // 과도한 초과근무
  | "CONSECUTIVE_LATE" // 연속 지각
  | "FREQUENT_ABSENCE"; // 잦은 결근

export interface AttendanceCheckResult {
  employeeId: string;
  employeeName: string;
  date: Date;
  alertType: AttendanceAlertType;
  message: string;
  details: Record<string, unknown>;
}

export interface AttendanceMonitorConfig {
  workStartTime: string;  // "09:00"
  workEndTime: string;    // "18:00"
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  overtimeAlertHours: number;
  consecutiveLateDays: number;
  frequentAbsenceDays: number;
  frequentAbsencePeriodDays: number;
}

// 기본 설정
const DEFAULT_CONFIG: AttendanceMonitorConfig = {
  workStartTime: "09:00",
  workEndTime: "18:00",
  lateThresholdMinutes: 10,
  earlyLeaveThresholdMinutes: 30,
  overtimeAlertHours: 3,
  consecutiveLateDays: 3,
  frequentAbsenceDays: 3,
  frequentAbsencePeriodDays: 30,
};

// ========================================
// 근태 모니터 클래스
// ========================================

export class AttendanceMonitor {
  private config: AttendanceMonitorConfig;

  constructor(config: Partial<AttendanceMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 일일 근태 이상 감지 (특정 날짜)
  async checkDailyAttendance(date: Date = new Date()): Promise<AttendanceCheckResult[]> {
    const targetDate = startOfDay(date);
    const alerts: AttendanceCheckResult[] = [];

    // 1. 근무일 확인 (공휴일/주말 제외)
    const isHoliday = await this.isHoliday(targetDate);
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

    if (isHoliday || isWeekend) {
      return alerts;
    }

    // 2. 모든 재직 직원 조회
    const employees = await prisma.employee.findMany({
      where: {
        user: { status: "ACTIVE" },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // 3. 해당 날짜의 근태 기록 조회
    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate,
      },
    });

    const attendanceMap = new Map(
      attendances.map((a) => [a.employeeId, a])
    );

    // 4. 각 직원별 체크
    for (const employee of employees) {
      const attendance = attendanceMap.get(employee.id);

      // 휴가 중인지 확인
      const onLeave = await this.isOnLeave(employee.id, targetDate);
      if (onLeave) continue;

      if (!attendance) {
        // 결근
        alerts.push({
          employeeId: employee.id,
          employeeName: employee.user.name,
          date: targetDate,
          alertType: "ABSENT",
          message: `${employee.user.name}님이 ${format(targetDate, "yyyy-MM-dd")}에 출근하지 않았습니다.`,
          details: { date: format(targetDate, "yyyy-MM-dd") },
        });
      } else {
        // 지각 체크
        if (attendance.checkIn) {
          const lateResult = this.checkLate(attendance.checkIn);
          if (lateResult.isLate) {
            alerts.push({
              employeeId: employee.id,
              employeeName: employee.user.name,
              date: targetDate,
              alertType: "LATE",
              message: `${employee.user.name}님이 ${lateResult.lateMinutes}분 지각했습니다.`,
              details: {
                checkIn: format(attendance.checkIn, "HH:mm"),
                expectedTime: this.config.workStartTime,
                lateMinutes: lateResult.lateMinutes,
              },
            });
          }
        }

        // 조퇴 체크
        if (attendance.checkOut) {
          const earlyLeaveResult = this.checkEarlyLeave(attendance.checkOut);
          if (earlyLeaveResult.isEarly) {
            alerts.push({
              employeeId: employee.id,
              employeeName: employee.user.name,
              date: targetDate,
              alertType: "EARLY_LEAVE",
              message: `${employee.user.name}님이 ${earlyLeaveResult.earlyMinutes}분 조퇴했습니다.`,
              details: {
                checkOut: format(attendance.checkOut, "HH:mm"),
                expectedTime: this.config.workEndTime,
                earlyMinutes: earlyLeaveResult.earlyMinutes,
              },
            });
          }
        } else {
          // 퇴근 미체크 (현재 시간이 퇴근 시간 이후인 경우)
          const now = new Date();
          const [endHour, endMin] = this.config.workEndTime.split(":").map(Number);
          const endTime = new Date(targetDate);
          endTime.setHours(endHour, endMin, 0, 0);

          if (now > endTime && format(now, "yyyy-MM-dd") === format(targetDate, "yyyy-MM-dd")) {
            alerts.push({
              employeeId: employee.id,
              employeeName: employee.user.name,
              date: targetDate,
              alertType: "NO_CHECKOUT",
              message: `${employee.user.name}님이 아직 퇴근 체크를 하지 않았습니다.`,
              details: { checkIn: format(attendance.checkIn!, "HH:mm") },
            });
          }
        }

        // 과도한 초과근무 체크
        if (attendance.overtimeMinutes) {
          const overtimeHours = attendance.overtimeMinutes / 60;
          if (overtimeHours >= this.config.overtimeAlertHours) {
            alerts.push({
              employeeId: employee.id,
              employeeName: employee.user.name,
              date: targetDate,
              alertType: "OVERTIME_EXCESS",
              message: `${employee.user.name}님이 ${overtimeHours.toFixed(1)}시간 초과 근무했습니다.`,
              details: { overtimeHours },
            });
          }
        }
      }
    }

    return alerts;
  }

  // 패턴 기반 이상 감지
  async checkPatterns(): Promise<AttendanceCheckResult[]> {
    const alerts: AttendanceCheckResult[] = [];
    const today = new Date();

    // 모든 재직 직원 조회
    const employees = await prisma.employee.findMany({
      where: { user: { status: "ACTIVE" } },
      include: { user: { select: { id: true, name: true } } },
    });

    for (const employee of employees) {
      // 연속 지각 체크
      const consecutiveLates = await this.checkConsecutiveLates(employee.id);
      if (consecutiveLates >= this.config.consecutiveLateDays) {
        alerts.push({
          employeeId: employee.id,
          employeeName: employee.user.name,
          date: today,
          alertType: "CONSECUTIVE_LATE",
          message: `${employee.user.name}님이 ${consecutiveLates}일 연속 지각했습니다.`,
          details: { consecutiveDays: consecutiveLates },
        });
      }

      // 잦은 결근 체크
      const frequentAbsences = await this.checkFrequentAbsences(employee.id);
      if (frequentAbsences >= this.config.frequentAbsenceDays) {
        alerts.push({
          employeeId: employee.id,
          employeeName: employee.user.name,
          date: today,
          alertType: "FREQUENT_ABSENCE",
          message: `${employee.user.name}님이 최근 ${this.config.frequentAbsencePeriodDays}일간 ${frequentAbsences}회 결근했습니다.`,
          details: {
            absenceCount: frequentAbsences,
            periodDays: this.config.frequentAbsencePeriodDays,
          },
        });
      }
    }

    return alerts;
  }

  // 알림 저장
  async saveAlerts(alerts: AttendanceCheckResult[]): Promise<number> {
    let savedCount = 0;

    for (const alert of alerts) {
      // 중복 체크 (같은 날짜, 같은 직원, 같은 유형)
      const existing = await prisma.attendanceAlert.findFirst({
        where: {
          employeeId: alert.employeeId,
          date: startOfDay(alert.date),
          alertType: alert.alertType,
        },
      });

      if (!existing) {
        await prisma.attendanceAlert.create({
          data: {
            employeeId: alert.employeeId,
            date: startOfDay(alert.date),
            alertType: alert.alertType,
            message: alert.message,
          },
        });
        savedCount++;
      }
    }

    return savedCount;
  }

  // ========================================
  // 헬퍼 메서드
  // ========================================

  private checkLate(checkIn: Date): { isLate: boolean; lateMinutes: number } {
    const [startHour, startMin] = this.config.workStartTime.split(":").map(Number);
    const expectedStart = new Date(checkIn);
    expectedStart.setHours(startHour, startMin, 0, 0);

    const lateMinutes = differenceInMinutes(checkIn, expectedStart);
    return {
      isLate: lateMinutes > this.config.lateThresholdMinutes,
      lateMinutes: Math.max(0, lateMinutes),
    };
  }

  private checkEarlyLeave(checkOut: Date): { isEarly: boolean; earlyMinutes: number } {
    const [endHour, endMin] = this.config.workEndTime.split(":").map(Number);
    const expectedEnd = new Date(checkOut);
    expectedEnd.setHours(endHour, endMin, 0, 0);

    const earlyMinutes = differenceInMinutes(expectedEnd, checkOut);
    return {
      isEarly: earlyMinutes > this.config.earlyLeaveThresholdMinutes,
      earlyMinutes: Math.max(0, earlyMinutes),
    };
  }

  private async isHoliday(date: Date): Promise<boolean> {
    const holiday = await prisma.holiday.findFirst({
      where: { date: startOfDay(date) },
    });
    return !!holiday;
  }

  private async isOnLeave(employeeId: string, date: Date): Promise<boolean> {
    const leave = await prisma.leave.findFirst({
      where: {
        employeeId,
        status: "APPROVED",
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
    return !!leave;
  }

  private async checkConsecutiveLates(employeeId: string): Promise<number> {
    const recentAttendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        status: "LATE",
      },
      orderBy: { date: "desc" },
      take: this.config.consecutiveLateDays + 5,
    });

    let consecutiveCount = 0;
    let lastDate: Date | null = null;

    for (const attendance of recentAttendances) {
      if (!lastDate) {
        consecutiveCount = 1;
        lastDate = attendance.date;
        continue;
      }

      const daysDiff = Math.abs(
        (lastDate.getTime() - attendance.date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        consecutiveCount++;
        lastDate = attendance.date;
      } else {
        break;
      }
    }

    return consecutiveCount;
  }

  private async checkFrequentAbsences(employeeId: string): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - this.config.frequentAbsencePeriodDays);

    const absences = await prisma.attendance.count({
      where: {
        employeeId,
        status: "ABSENT",
        date: { gte: startOfDay(startDate) },
      },
    });

    return absences;
  }
}

// 기본 인스턴스 내보내기
export const attendanceMonitor = new AttendanceMonitor();

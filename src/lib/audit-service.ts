// 고급 감사 로그 서비스
// Phase 3.5: 사용자 행위 추적

import { prisma } from "./prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// ========================================
// 타입 정의
// ========================================

export type AuditAction =
  | "CREATE" | "READ" | "UPDATE" | "DELETE"
  | "LOGIN" | "LOGOUT" | "LOGIN_FAILED"
  | "EXPORT" | "IMPORT" | "PRINT"
  | "APPROVE" | "REJECT"
  | "ACCESS_DENIED" | "SENSITIVE_ACCESS"
  | "AUTOMATION" | "SYSTEM";

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: AuditMetadata;
}

export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  affectedCount?: number;
}

export interface AuditSearchParams {
  userId?: string;
  action?: AuditAction | AuditAction[];
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

// ========================================
// 감사 로그 서비스
// ========================================

export class AuditService {
  /**
   * 감사 로그 기록
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId || "",
          oldValue: entry.oldValue ? JSON.parse(JSON.stringify(entry.oldValue)) : undefined,
          newValue: entry.newValue ? JSON.parse(JSON.stringify(entry.newValue)) : undefined,
        },
      });
    } catch (error) {
      // 로깅 실패 시에도 메인 작업에 영향 없도록
      console.error("Audit log failed:", error);
    }
  }

  /**
   * 데이터 변경 로그 (CREATE/UPDATE/DELETE)
   */
  static async logChange(
    userId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    entityType: string,
    entityId: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
    });
  }

  /**
   * 로그인/로그아웃 기록
   */
  static async logAuth(
    userId: string,
    action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED",
    metadata?: AuditMetadata
  ): Promise<void> {
    await this.log({
      userId,
      action,
      entityType: "Session",
      metadata,
    });
  }

  /**
   * 민감 데이터 접근 기록
   */
  static async logSensitiveAccess(
    userId: string,
    entityType: string,
    entityId: string,
    accessGranted: boolean
  ): Promise<void> {
    await this.log({
      userId,
      action: accessGranted ? "SENSITIVE_ACCESS" : "ACCESS_DENIED",
      entityType,
      entityId,
    });
  }

  /**
   * 데이터 내보내기 기록
   */
  static async logExport(
    userId: string,
    entityType: string,
    recordCount: number,
    format: string
  ): Promise<void> {
    await this.log({
      userId,
      action: "EXPORT",
      entityType,
      newValue: {
        recordCount,
        format,
        exportedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 감사 로그 조회
   */
  static async search(params: AuditSearchParams) {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
    } = params;

    const where = {
      ...(userId && { userId }),
      ...(action && {
        action: Array.isArray(action) ? { in: action } : action,
      }),
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 사용자별 활동 요약
   */
  static async getUserActivitySummary(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.auditLog.groupBy({
      by: ["action"],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: { _all: true },
    });

    const recentLogs = await prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      summary: logs.reduce(
        (acc, log) => ({ ...acc, [log.action]: log._count._all }),
        {} as Record<string, number>
      ),
      recentActivities: recentLogs,
      period: `${format(startDate, "yyyy-MM-dd", { locale: ko })} ~ ${format(new Date(), "yyyy-MM-dd", { locale: ko })}`,
    };
  }

  /**
   * 엔티티별 변경 이력
   */
  static async getEntityHistory(entityType: string, entityId: string) {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return logs.map((log) => ({
      action: log.action,
      user: log.user.name,
      timestamp: log.createdAt,
      changes: this.computeChanges(
        log.oldValue as Record<string, unknown> | null,
        log.newValue as Record<string, unknown> | null
      ),
    }));
  }

  /**
   * 변경 사항 계산
   */
  private static computeChanges(
    oldValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null
  ): Array<{ field: string; before: unknown; after: unknown }> {
    if (!oldValue && !newValue) return [];
    if (!oldValue) {
      return Object.entries(newValue!).map(([field, after]) => ({
        field,
        before: null,
        after,
      }));
    }
    if (!newValue) {
      return Object.entries(oldValue).map(([field, before]) => ({
        field,
        before,
        after: null,
      }));
    }

    const changes: Array<{ field: string; before: unknown; after: unknown }> = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
        changes.push({
          field: key,
          before: oldValue[key],
          after: newValue[key],
        });
      }
    }

    return changes;
  }
}

// 편의 함수
export const audit = AuditService.log.bind(AuditService);
export const auditChange = AuditService.logChange.bind(AuditService);
export const auditAuth = AuditService.logAuth.bind(AuditService);
export const auditExport = AuditService.logExport.bind(AuditService);

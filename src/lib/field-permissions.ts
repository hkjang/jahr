// 필드 단위 권한 관리
// Phase 3.2: 항목별 조회/수정 제어

import { prisma } from "./prisma";
import { SENSITIVE_FIELDS, maskObject, MaskingRule } from "./data-masking";

// ========================================
// 타입 정의
// ========================================

export type PermissionAction = "read" | "write" | "mask";

export interface FieldPermission {
  entityType: string;
  fieldName: string;
  canRead: boolean;
  canWrite: boolean;
  maskIfNoPermission: boolean;
}

export interface FieldPermissionMap {
  [entityType: string]: {
    [fieldName: string]: {
      read: boolean;
      write: boolean;
      mask: boolean;
    };
  };
}

// ========================================
// 기본 필드 권한 정의
// ========================================

// 엔티티별 민감 필드 정의
export const PROTECTED_FIELDS: Record<string, string[]> = {
  User: ["password", "email", "phoneNumber"],
  Employee: ["birthDate", "phoneNumber"],
  Salary: ["baseSalary", "netSalary", "totalEarnings", "totalDeductions", "bonus", "allowances", "deductions"],
  Family: ["name", "birthDate", "contact"],
  Document: ["filePath"],
};

// 역할별 기본 필드 권한
export const ROLE_FIELD_PERMISSIONS: Record<string, Record<string, string[]>> = {
  // 시스템 관리자: 모든 필드 접근 가능
  SYSTEM_ADMIN: {
    "*": ["*"], // 모든 엔티티의 모든 필드
  },
  
  // HR 관리자: 급여 정보 포함 모든 인사 정보 접근
  HR_ADMIN: {
    User: ["*"],
    Employee: ["*"],
    Salary: ["*"],
    Family: ["*"],
    Document: ["*"],
  },
  
  // 팀장: 팀원 정보 조회 (급여 제외)
  TEAM_LEADER: {
    User: ["name", "email", "status"],
    Employee: ["organizationId", "positionId", "hireDate", "employmentType", "workType"],
    Salary: [], // 급여 정보 접근 불가
    Family: [], // 가족 정보 접근 불가
  },
  
  // 일반 직원: 본인 정보만
  EMPLOYEE: {
    User: ["name", "email", "phoneNumber"], // 본인 정보만
    Employee: ["organizationId", "positionId", "hireDate"],
    Salary: ["netSalary"], // 본인 실수령액만
    Family: ["*"], // 본인 가족 정보
  },
};

// ========================================
// 필드 권한 서비스
// ========================================

export class FieldPermissionService {
  /**
   * 사용자의 특정 엔티티/필드에 대한 권한 확인
   */
  static async checkPermission(
    userId: string,
    entityType: string,
    fieldName: string,
    action: PermissionAction = "read"
  ): Promise<boolean> {
    // 사용자 역할 조회
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const roleCodes = userRoles.map((ur) => ur.role.code);

    // 시스템 관리자는 모든 권한
    if (roleCodes.includes("SYSTEM_ADMIN")) {
      return true;
    }

    // 각 역할별 권한 확인
    for (const roleCode of roleCodes) {
      const rolePermissions = ROLE_FIELD_PERMISSIONS[roleCode];
      if (!rolePermissions) continue;

      // 와일드카드 권한 체크
      if (rolePermissions["*"]?.includes("*")) {
        return true;
      }

      // 엔티티별 권한 체크
      const entityPermissions = rolePermissions[entityType];
      if (entityPermissions) {
        if (entityPermissions.includes("*") || entityPermissions.includes(fieldName)) {
          return action !== "write" || this.isWriteAllowed(roleCode, entityType, fieldName);
        }
      }
    }

    return false;
  }

  /**
   * 쓰기 권한 확인
   */
  private static isWriteAllowed(
    roleCode: string,
    entityType: string,
    fieldName: string
  ): boolean {
    // HR 관리자와 시스템 관리자만 쓰기 가능
    if (roleCode === "SYSTEM_ADMIN" || roleCode === "HR_ADMIN") {
      return true;
    }

    // 특정 필드는 본인만 수정 가능
    const selfEditableFields: Record<string, string[]> = {
      User: ["phoneNumber", "profileImage"],
      Employee: [], // 본인 수정 불가
    };

    return selfEditableFields[entityType]?.includes(fieldName) || false;
  }

  /**
   * 사용자의 엔티티에 대한 전체 필드 권한 맵 조회
   */
  static async getPermissionMap(
    userId: string,
    entityType: string
  ): Promise<Record<string, { read: boolean; write: boolean }>> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const roleCodes = userRoles.map((ur) => ur.role.code);
    const permissions: Record<string, { read: boolean; write: boolean }> = {};
    const protectedFields = PROTECTED_FIELDS[entityType] || [];

    // 모든 필드에 대해 권한 확인
    for (const fieldName of protectedFields) {
      permissions[fieldName] = {
        read: await this.checkPermission(userId, entityType, fieldName, "read"),
        write: await this.checkPermission(userId, entityType, fieldName, "write"),
      };
    }

    return permissions;
  }

  /**
   * 본인 데이터인지 확인
   */
  static async isSelfData(
    userId: string,
    entityType: string,
    entityId: string
  ): Promise<boolean> {
    switch (entityType) {
      case "User":
        return userId === entityId;
      case "Employee":
        const employee = await prisma.employee.findUnique({
          where: { id: entityId },
          select: { userId: true },
        });
        return employee?.userId === userId;
      case "Salary":
        const salary = await prisma.salary.findUnique({
          where: { id: entityId },
          include: { employee: { select: { userId: true } } },
        });
        return salary?.employee.userId === userId;
      default:
        return false;
    }
  }
}

// ========================================
// 데이터 필터링 유틸리티
// ========================================

/**
 * 권한에 따라 객체 필드 필터링/마스킹
 */
export async function filterByPermission<T extends Record<string, unknown>>(
  data: T,
  entityType: string,
  userId: string,
  entityId?: string
): Promise<T> {
  const isSelf = entityId 
    ? await FieldPermissionService.isSelfData(userId, entityType, entityId)
    : false;

  // 본인 데이터면 마스킹 없이 반환 (단, 비밀번호 제외)
  if (isSelf && entityType !== "User") {
    const result = { ...data };
    delete (result as Record<string, unknown>)["password"];
    return result;
  }

  const permissions = await FieldPermissionService.getPermissionMap(userId, entityType);
  const result = { ...data };

  // 권한 없는 필드 처리
  for (const [fieldName, perm] of Object.entries(permissions)) {
    if (!perm.read) {
      // 마스킹 규칙이 있으면 마스킹, 없으면 제거
      const maskingRules = SENSITIVE_FIELDS[entityType];
      if (maskingRules) {
        const rule = maskingRules.find((r) => r.field === fieldName);
        if (rule && result[fieldName] !== undefined) {
          const masked = maskObject({ [fieldName]: result[fieldName] }, [rule]);
          (result as Record<string, unknown>)[fieldName] = masked[fieldName];
        } else {
          delete (result as Record<string, unknown>)[fieldName];
        }
      } else {
        delete (result as Record<string, unknown>)[fieldName];
      }
    }
  }

  // 비밀번호는 항상 제거
  delete (result as Record<string, unknown>)["password"];

  return result;
}

/**
 * 배열 데이터 필터링
 */
export async function filterArrayByPermission<T extends Record<string, unknown>>(
  data: T[],
  entityType: string,
  userId: string,
  getEntityId?: (item: T) => string
): Promise<T[]> {
  return Promise.all(
    data.map((item) =>
      filterByPermission(item, entityType, userId, getEntityId?.(item))
    )
  );
}

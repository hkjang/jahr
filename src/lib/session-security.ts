// 세션 보안 서비스
// Phase 3.4: 동시 로그인 제한

import { prisma } from "./prisma";

// ========================================
// 타입 정의
// ========================================

export interface SessionInfo {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expires: Date;
  isCurrent: boolean;
}

export interface SessionSecurityConfig {
  maxConcurrentSessions: number;
  sessionExpiryHours: number;
  enforceIpCheck: boolean;
  notifyOnNewLogin: boolean;
}

// 기본 설정
const DEFAULT_CONFIG: SessionSecurityConfig = {
  maxConcurrentSessions: 3, // 최대 3개 세션
  sessionExpiryHours: 24,   // 24시간 후 만료
  enforceIpCheck: false,    // IP 변경 시 재인증 비활성화
  notifyOnNewLogin: true,   // 새 로그인 시 알림
};

// ========================================
// 세션 보안 서비스
// ========================================

export class SessionSecurityService {
  private config: SessionSecurityConfig;

  constructor(config: Partial<SessionSecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 사용자의 활성 세션 목록 조회
   */
  async getActiveSessions(userId: string, currentSessionId?: string): Promise<SessionInfo[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: "desc" },
    });

    return sessions.map((session: { id: string; userId: string; expiresAt: Date }) => ({
      id: session.id,
      userId: session.userId,
      userAgent: "Unknown Device",
      createdAt: new Date(),
      expires: session.expiresAt,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * 동시 로그인 체크 및 제한
   */
  async checkConcurrentLogin(userId: string, newSessionId: string): Promise<{
    allowed: boolean;
    revokedSessions: string[];
  }> {
    const activeSessions = await this.getActiveSessions(userId);
    
    // 현재 세션 제외한 활성 세션 수
    const otherSessions = activeSessions.filter((s) => s.id !== newSessionId);
    
    if (otherSessions.length < this.config.maxConcurrentSessions) {
      return { allowed: true, revokedSessions: [] };
    }

    // 가장 오래된 세션들 비활성화
    const sessionsToRevoke = otherSessions
      .slice(this.config.maxConcurrentSessions - 1)
      .map((s) => s.id);

    await this.revokeSessions(sessionsToRevoke);

    return {
      allowed: true,
      revokedSessions: sessionsToRevoke,
    };
  }

  /**
   * 세션 비활성화
   */
  async revokeSessions(sessionIds: string[]): Promise<number> {
    if (sessionIds.length === 0) return 0;

    const result = await prisma.session.deleteMany({
      where: {
        id: { in: sessionIds },
      },
    });

    return result.count;
  }

  /**
   * 특정 세션 제외 모든 세션 비활성화
   */
  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });

    return result.count;
  }

  /**
   * 모든 세션 비활성화 (로그아웃 전체)
   */
  async revokeAllSessions(userId: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  /**
   * 만료된 세션 정리
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }

  /**
   * 세션 유효성 검증
   */
  async validateSession(sessionId: string, userId: string): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { valid: false, reason: "세션을 찾을 수 없습니다." };
    }

    if (session.userId !== userId) {
      return { valid: false, reason: "세션이 사용자와 일치하지 않습니다." };
    }

    if (session.expiresAt < new Date()) {
      return { valid: false, reason: "세션이 만료되었습니다." };
    }

    return { valid: true };
  }

  private parseUserAgent(_sessionToken: string): string {
    // 실제로는 세션 생성 시 별도로 user-agent를 저장
    return "Unknown Device";
  }
}

// ========================================
// 접근 승인 워크플로우
// Phase 3.3: 민감 정보 사전 승인
// ========================================

export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface AccessRequest {
  id: string;
  requesterId: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  status: AccessRequestStatus;
  approverId?: string;
  approvedAt?: Date;
  expiresAt?: Date;
}

export class AccessApprovalService {
  // 민감 리소스 유형 정의
  static readonly SENSITIVE_RESOURCES = [
    "Salary",           // 급여 정보
    "SalaryHistory",    // 급여 이력
    "Document.personal", // 개인 문서
    "Employee.ssn",     // 주민번호
    "Family",           // 가족 정보
  ];

  // 메모리 기반 임시 저장소 (실제 구현 시 DB 테이블 사용)
  private static pendingRequests = new Map<string, {
    id: string;
    requesterId: string;
    resourceType: string;
    resourceId: string;
    reason: string;
    status: AccessRequestStatus;
    createdAt: Date;
  }>();

  /**
   * 접근 승인 필요 여부 확인
   */
  static requiresApproval(resourceType: string, _userId: string): boolean {
    return this.SENSITIVE_RESOURCES.some(
      (sr) => resourceType.startsWith(sr)
    );
  }

  /**
   * 접근 요청 생성
   */
  static async createRequest(
    requesterId: string,
    resourceType: string,
    resourceId: string,
    reason: string,
    _expiryHours: number = 24
  ): Promise<string> {
    const id = `access_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    this.pendingRequests.set(id, {
      id,
      requesterId,
      resourceType,
      resourceId,
      reason,
      status: "PENDING",
      createdAt: new Date(),
    });

    console.log(`[AccessApproval] Request created: ${id}`);
    return id;
  }

  /**
   * 접근 요청 승인
   */
  static async approveRequest(
    requestId: string,
    _approverId: string
  ): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (request) {
      request.status = "APPROVED";
      console.log(`[AccessApproval] Request approved: ${requestId}`);
    }
  }

  /**
   * 접근 요청 거절
   */
  static async rejectRequest(
    requestId: string,
    _approverId: string,
    _reason?: string
  ): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (request) {
      request.status = "REJECTED";
      console.log(`[AccessApproval] Request rejected: ${requestId}`);
    }
  }

  /**
   * 승인된 접근 권한 확인
   */
  static async hasApprovedAccess(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    for (const request of this.pendingRequests.values()) {
      if (
        request.requesterId === userId &&
        request.resourceType === resourceType &&
        request.resourceId === resourceId &&
        request.status === "APPROVED"
      ) {
        return true;
      }
    }
    return false;
  }
}

// 기본 인스턴스
export const sessionSecurity = new SessionSecurityService();

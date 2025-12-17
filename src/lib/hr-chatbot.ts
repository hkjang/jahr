// HR 챗봇 서비스
// Phase 4.4: 인사 규정 질의응답

import { prisma } from "./prisma";

// ========================================
// 타입 정의
// ========================================

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  userId: string;
  employeeId?: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  sources?: string[];
  suggestedQuestions?: string[];
}

// ========================================
// HR 규정 지식 베이스
// ========================================

const HR_KNOWLEDGE_BASE: Record<string, { answer: string; keywords: string[] }> = {
  "연차 휴가 발생": {
    answer: "연차 휴가는 입사일 기준으로 발생합니다.\n- 입사 후 1년 미만: 매월 1일씩 발생 (최대 11일)\n- 입사 1년 이상: 15일 발생\n- 이후 매 2년마다 1일씩 가산 (최대 25일)",
    keywords: ["연차", "휴가", "발생", "일수", "몇일"],
  },
  "휴가 신청 방법": {
    answer: "휴가 신청은 포털 > 휴가 신청 메뉴에서 가능합니다.\n1. 희망 일자 선택\n2. 휴가 종류 선택 (연차, 반차 등)\n3. 사유 입력\n4. 결재선 확인 후 신청\n\n신청 후 상위자 승인을 받으면 휴가가 확정됩니다.",
    keywords: ["휴가", "신청", "방법", "어떻게"],
  },
  "연차 촉진": {
    answer: "연차 촉진 제도는 연차 사용률이 낮은 직원에게 휴가 사용을 권장하는 제도입니다.\n- 연도말 기준 잔여 연차가 있을 경우 사용 촉진 통보\n- 촉진 통보에도 미사용 시 연차 소멸 가능\n- 회사는 연차 촉진 의무가 있음",
    keywords: ["연차", "촉진", "소멸", "미사용"],
  },
  "급여 명세서": {
    answer: "급여 명세서는 매월 급여 지급일에 포털에서 확인 가능합니다.\n- 포털 > 급여 > 급여 명세서 조회\n- PDF 다운로드 가능\n- 최근 12개월 이력 조회 가능",
    keywords: ["급여", "명세서", "확인", "조회"],
  },
  "근태 수정": {
    answer: "출퇴근 기록 수정이 필요한 경우:\n1. 포털 > 근태 > 근태 수정 신청\n2. 수정 사유 입력\n3. 상위자 승인 후 반영\n\n시스템 오류의 경우 인사팀에 문의하세요.",
    keywords: ["근태", "수정", "출퇴근", "정정"],
  },
  "육아휴직": {
    answer: "육아휴직 신청 조건:\n- 만 8세 이하 또는 초등학교 2학년 이하 자녀\n- 최대 1년 사용 가능 (자녀 1명당)\n- 급여: 통상임금의 80% (상한/하한 있음)\n- 신청: 인사팀에 30일 전 신청",
    keywords: ["육아휴직", "육아", "출산", "자녀"],
  },
  "경조사 휴가": {
    answer: "경조사 휴가 기준:\n- 본인 결혼: 5일\n- 배우자 출산: 10일\n- 부모/배우자 부모 사망: 5일\n- 조부모/형제자매 사망: 3일\n- 자녀 결혼: 1일\n\n※ 증빙 서류 제출 필요",
    keywords: ["경조사", "결혼", "사망", "출산"],
  },
  "평가 기간": {
    answer: "인사평가는 연 2회 실시됩니다.\n- 상반기: 7월 (1~6월 실적 평가)\n- 하반기: 1월 (7~12월 실적 평가)\n\n평가 절차: 자기평가 → 상위자평가 → 조정 → 확정",
    keywords: ["평가", "기간", "언제", "인사평가"],
  },
  "교육 신청": {
    answer: "사내/외 교육 신청 방법:\n1. 포털 > 교육 > 교육 신청\n2. 희망 과정 선택\n3. 상위자 승인 후 등록\n\n필수 교육은 자동 배정되며, 선택 교육은 본인 신청입니다.",
    keywords: ["교육", "신청", "수강", "과정"],
  },
  "재직증명서": {
    answer: "재직증명서 발급:\n1. 포털 > 증명서 발급\n2. 재직증명서 선택\n3. 용도 선택 후 발급\n\n온라인 발급 즉시 가능하며, 원본이 필요한 경우 인사팀 문의",
    keywords: ["재직증명서", "증명서", "발급"],
  },
};

// ========================================
// HR 챗봇 서비스
// ========================================

export class HRChatbotService {
  /**
   * 사용자 질문 처리
   */
  static async processQuery(
    query: string,
    context?: Partial<ChatContext>
  ): Promise<ChatResponse> {
    const normalizedQuery = query.toLowerCase().trim();

    // 1. 지식 베이스에서 검색
    const matchedKnowledge = this.searchKnowledgeBase(normalizedQuery);
    
    if (matchedKnowledge.length > 0) {
      const bestMatch = matchedKnowledge[0];
      return {
        message: bestMatch.answer,
        sources: ["HR 규정집"],
        suggestedQuestions: this.getSuggestedQuestions(normalizedQuery),
      };
    }

    // 2. 개인화된 정보 조회 (로그인된 사용자)
    if (context?.employeeId) {
      const personalResponse = await this.handlePersonalQuery(
        normalizedQuery,
        context.employeeId
      );
      if (personalResponse) {
        return personalResponse;
      }
    }

    // 3. 기본 응답
    return {
      message: "죄송합니다. 해당 질문에 대한 답변을 찾지 못했습니다.\n\n인사팀에 직접 문의하시거나, 아래 자주 묻는 질문을 확인해주세요.",
      suggestedQuestions: [
        "연차 휴가는 몇 일인가요?",
        "휴가는 어떻게 신청하나요?",
        "급여 명세서는 어디서 확인하나요?",
        "재직증명서는 어떻게 발급하나요?",
      ],
    };
  }

  /**
   * 지식 베이스 검색
   */
  private static searchKnowledgeBase(
    query: string
  ): Array<{ topic: string; answer: string; score: number }> {
    const results: Array<{ topic: string; answer: string; score: number }> = [];

    for (const [topic, { answer, keywords }] of Object.entries(HR_KNOWLEDGE_BASE)) {
      let score = 0;
      
      // 키워드 매칭
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          score += 10;
        }
      }

      // 토픽 이름 매칭
      if (query.includes(topic.toLowerCase())) {
        score += 20;
      }

      if (score > 0) {
        results.push({ topic, answer, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 개인화된 질문 처리
   */
  private static async handlePersonalQuery(
    query: string,
    employeeId: string
  ): Promise<ChatResponse | null> {
    // 잔여 연차 조회
    if (query.includes("연차") && (query.includes("남은") || query.includes("잔여") || query.includes("몇일"))) {
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId,
          year: new Date().getFullYear(),
          leaveType: "ANNUAL",
        },
      });

      if (balance) {
        return {
          message: `현재 연차 현황:\n- 총 연차: ${balance.totalDays}일\n- 사용: ${balance.usedDays}일\n- 잔여: ${balance.totalDays - balance.usedDays}일`,
          suggestedQuestions: ["휴가는 어떻게 신청하나요?", "연차 촉진이 뭔가요?"],
        };
      }
    }

    // 급여일 조회
    if (query.includes("급여") && (query.includes("언제") || query.includes("지급일"))) {
      return {
        message: "급여 지급일은 매월 25일입니다.\n(주말/공휴일인 경우 전 영업일 지급)\n\n급여 명세서는 포털에서 확인 가능합니다.",
        suggestedQuestions: ["급여 명세서는 어디서 확인하나요?"],
      };
    }

    return null;
  }

  /**
   * 관련 질문 추천
   */
  private static getSuggestedQuestions(query: string): string[] {
    const suggestions: string[] = [];
    
    if (query.includes("연차") || query.includes("휴가")) {
      suggestions.push("휴가는 어떻게 신청하나요?");
      suggestions.push("연차 촉진이 뭔가요?");
      suggestions.push("경조사 휴가는 몇 일인가요?");
    }
    
    if (query.includes("급여")) {
      suggestions.push("급여 명세서는 어디서 확인하나요?");
      suggestions.push("급여일은 언제인가요?");
    }
    
    if (query.includes("교육")) {
      suggestions.push("필수 교육은 뭐가 있나요?");
      suggestions.push("교육은 어떻게 신청하나요?");
    }

    return suggestions.slice(0, 3);
  }

  /**
   * 대화 기록 저장
   */
  static async saveConversation(
    userId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    // 실제 구현에서는 별도 테이블에 저장
    console.log(`Saving conversation for user ${userId}:`, messages.length, "messages");
  }
}

// ========================================
// 요약 리포트 서비스 (Phase 4.5)
// ========================================

export interface DepartmentSummary {
  organizationId: string;
  organizationName: string;
  totalEmployees: number;
  newHires: number;
  resignations: number;
  averageAttendanceRate: number;
  averageLeaveUsage: number;
  averageEvaluationScore: number;
  alerts: string[];
}

export class SummaryReportService {
  /**
   * 부서별 인사 요약 생성
   */
  static async generateDepartmentSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DepartmentSummary> {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // 총 직원 수
    const employees = await prisma.employee.findMany({
      where: {
        organizationId,
        user: { status: "ACTIVE" },
      },
    });
    const totalEmployees = employees.length;

    // 신규 입사
    const newHires = await prisma.employee.count({
      where: {
        organizationId,
        hireDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 퇴사
    const resignations = await prisma.appointment.count({
      where: {
        employee: { organizationId },
        type: { in: ["RESIGNATION", "RETIREMENT"] },
        effectiveDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 평균 출근율
    const attendanceData = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        employee: { organizationId },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { _all: true },
    });

    const totalAttendance = attendanceData.reduce((sum, d) => sum + d._count._all, 0);
    const normalAttendance = attendanceData.find((d) => d.status === "NORMAL")?._count._all || 0;
    const averageAttendanceRate = totalAttendance > 0 
      ? (normalAttendance / totalAttendance) * 100 
      : 0;

    // 평균 연차 사용률
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employee: { organizationId },
        year: new Date().getFullYear(),
        leaveType: "ANNUAL",
      },
    });

    const averageLeaveUsage = leaveBalances.length > 0
      ? leaveBalances.reduce((sum, lb) => sum + (lb.usedDays / lb.totalDays), 0) / leaveBalances.length * 100
      : 0;

    // 평균 평가 점수
    const evaluations = await prisma.evaluation.findMany({
      where: {
        employee: { organizationId },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { finalScore: true },
    });

    const scoresWithValues = evaluations.filter((e) => e.finalScore !== null);
    const averageEvaluationScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, e) => sum + Number(e.finalScore || 0), 0) / scoresWithValues.length
      : 0;

    // 알림 생성
    const alerts: string[] = [];
    
    if (averageAttendanceRate < 90) {
      alerts.push(`출근율이 ${averageAttendanceRate.toFixed(1)}%로 낮습니다.`);
    }
    if (averageLeaveUsage < 30) {
      alerts.push(`연차 사용률이 ${averageLeaveUsage.toFixed(1)}%로 저조합니다.`);
    }
    if (resignations > 0 && resignations / totalEmployees > 0.1) {
      alerts.push(`이탈률이 ${((resignations / totalEmployees) * 100).toFixed(1)}%로 높습니다.`);
    }

    return {
      organizationId,
      organizationName: organization.name,
      totalEmployees,
      newHires,
      resignations,
      averageAttendanceRate,
      averageLeaveUsage,
      averageEvaluationScore,
      alerts,
    };
  }

  /**
   * 전사 인사 요약 생성
   */
  static async generateCompanySummary(
    startDate: Date,
    endDate: Date
  ): Promise<{
    overall: Omit<DepartmentSummary, "organizationId" | "organizationName">;
    departments: DepartmentSummary[];
  }> {
    const organizations = await prisma.organization.findMany({
      where: {
        parentId: null, // 최상위 부서만
      },
    });

    const departments = await Promise.all(
      organizations.map((org) =>
        this.generateDepartmentSummary(org.id, startDate, endDate)
      )
    );

    // 전사 합계
    const overall = {
      totalEmployees: departments.reduce((sum, d) => sum + d.totalEmployees, 0),
      newHires: departments.reduce((sum, d) => sum + d.newHires, 0),
      resignations: departments.reduce((sum, d) => sum + d.resignations, 0),
      averageAttendanceRate: departments.reduce((sum, d) => sum + d.averageAttendanceRate, 0) / departments.length || 0,
      averageLeaveUsage: departments.reduce((sum, d) => sum + d.averageLeaveUsage, 0) / departments.length || 0,
      averageEvaluationScore: departments.reduce((sum, d) => sum + d.averageEvaluationScore, 0) / departments.length || 0,
      alerts: departments.flatMap((d) => d.alerts),
    };

    return { overall, departments };
  }
}

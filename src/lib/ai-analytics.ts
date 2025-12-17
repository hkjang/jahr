// AI 기반 HR 분석 서비스
// Phase 4: 인력 이탈 예측, 성과 분석, 교육 추천

import { prisma } from "./prisma";
import { subMonths, differenceInMonths } from "date-fns";

// ========================================
// 타입 정의
// ========================================

export interface TurnoverPrediction {
  employeeId: string;
  employeeName: string;
  riskScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: TurnoverFactor[];
  recommendation?: string;
}

export interface TurnoverFactor {
  name: string;
  impact: number; // -10 ~ +10
  description: string;
}

export interface PerformanceBias {
  evaluatorId: string;
  evaluatorName: string;
  biasType: "LENIENT" | "STRICT" | "CENTRAL_TENDENCY" | "HALO_EFFECT";
  severity: "LOW" | "MEDIUM" | "HIGH";
  evidence: string;
}

export interface TrainingRecommendation {
  employeeId: string;
  recommendations: Array<{
    courseId?: string;
    courseName: string;
    reason: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    matchScore: number;
  }>;
}

// ========================================
// 이탈 예측 서비스
// ========================================

export class TurnoverPredictionService {
  /**
   * 인력 이탈 위험도 예측
   * 근태, 성과, 연차 사용, 급여, 근속 기간 등 기반
   */
  static async predictTurnover(employeeId: string): Promise<TurnoverPrediction> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: { select: { name: true } },
        position: true,
        organization: true,
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const factors: TurnoverFactor[] = [];
    let riskScore = 50; // 기본 점수

    // 1. 근속 기간 분석
    const tenure = differenceInMonths(new Date(), employee.hireDate);
    if (tenure < 12) {
      factors.push({
        name: "신입 직원",
        impact: 5,
        description: "입사 1년 미만 직원은 이탈률이 높음",
      });
      riskScore += 5;
    } else if (tenure > 60) {
      factors.push({
        name: "장기 근속",
        impact: -10,
        description: "5년 이상 근속하여 이탈 가능성 낮음",
      });
      riskScore -= 10;
    }

    // 2. 최근 3개월 근태 분석
    const threeMonthsAgo = subMonths(new Date(), 3);
    const attendanceStats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        employeeId,
        date: { gte: threeMonthsAgo },
      },
      _count: { _all: true },
    });

    const lateCount = attendanceStats.find((s) => s.status === "LATE")?._count._all || 0;
    const absentCount = attendanceStats.find((s) => s.status === "ABSENT")?._count._all || 0;

    if (lateCount > 5 || absentCount > 2) {
      factors.push({
        name: "근태 불량",
        impact: 10,
        description: `최근 3개월 지각 ${lateCount}회, 결근 ${absentCount}회`,
      });
      riskScore += 10;
    }

    // 3. 연차 사용률 분석
    const currentYear = new Date().getFullYear();
    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        year: currentYear,
        leaveType: "ANNUAL",
      },
    });

    if (leaveBalance) {
      const usageRate = leaveBalance.usedDays / leaveBalance.totalDays;
      if (usageRate < 0.3) {
        factors.push({
          name: "연차 미사용",
          impact: 5,
          description: "연차 사용률이 30% 미만으로 번아웃 가능성",
        });
        riskScore += 5;
      } else if (usageRate > 0.9) {
        factors.push({
          name: "연차 과다 사용",
          impact: 7,
          description: "연차를 거의 소진하여 이탈 준비 가능성",
        });
        riskScore += 7;
      }
    }

    // 4. 최근 평가 점수 분석
    const recentEvaluation = await prisma.evaluation.findFirst({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });

    if (recentEvaluation?.finalScore) {
      const score = Number(recentEvaluation.finalScore);
      if (score < 60) {
        factors.push({
          name: "저성과",
          impact: -5,
          description: "최근 평가 점수가 60점 미만 (불만족으로 이탈보다 해고 위험)",
        });
        riskScore -= 5;
      } else if (score > 90) {
        factors.push({
          name: "고성과",
          impact: 5,
          description: "높은 성과자로 스카우트 가능성",
        });
        riskScore += 5;
      }
    }

    // 5. 승진 정체 분석 (동일 직급 3년 이상)
    const appointments = await prisma.appointment.findMany({
      where: {
        employeeId,
        type: "PROMOTION",
      },
      orderBy: { effectiveDate: "desc" },
      take: 1,
    });

    const lastPromotion = appointments[0]?.effectiveDate;
    const monthsSincePromotion = lastPromotion
      ? differenceInMonths(new Date(), lastPromotion)
      : tenure;

    if (monthsSincePromotion > 36) {
      factors.push({
        name: "승진 정체",
        impact: 8,
        description: "3년 이상 동일 직급 유지",
      });
      riskScore += 8;
    }

    // 점수 범위 제한 (0-100)
    riskScore = Math.max(0, Math.min(100, riskScore));

    // 위험 수준 결정
    let riskLevel: TurnoverPrediction["riskLevel"];
    if (riskScore >= 75) riskLevel = "CRITICAL";
    else if (riskScore >= 60) riskLevel = "HIGH";
    else if (riskScore >= 40) riskLevel = "MEDIUM";
    else riskLevel = "LOW";

    // 권장 사항
    let recommendation: string | undefined;
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      recommendation = "면담 및 경력 개발 지원 권장";
    } else if (riskLevel === "MEDIUM") {
      recommendation = "정기 모니터링 필요";
    }

    return {
      employeeId,
      employeeName: employee.user.name,
      riskScore,
      riskLevel,
      factors,
      recommendation,
    };
  }

  /**
   * 전체 직원 이탈 위험도 분석
   */
  static async analyzeAllEmployees(): Promise<TurnoverPrediction[]> {
    const employees = await prisma.employee.findMany({
      where: {
        user: { status: "ACTIVE" },
      },
      select: { id: true },
    });

    const predictions = await Promise.all(
      employees.map((e) => this.predictTurnover(e.id).catch(() => null))
    );

    return predictions
      .filter((p): p is TurnoverPrediction => p !== null)
      .sort((a, b) => b.riskScore - a.riskScore);
  }
}

// ========================================
// 성과 분석 서비스
// ========================================

export class PerformanceAnalysisService {
  /**
   * 평가 편향 탐지
   */
  static async detectBias(periodId: string): Promise<PerformanceBias[]> {
    const evaluations = await prisma.evaluation.findMany({
      where: { periodId },
      include: {
        employee: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    // 평가자별 점수 그룹화
    const evaluatorScores = new Map<string, number[]>();
    
    for (const evaluation of evaluations) {
      // evaluatorId가 별도로 저장되어 있다고 가정
      const evaluatorId = (evaluation as Record<string, unknown>).evaluatorId as string | undefined;
      if (!evaluatorId || !evaluation.finalScore) continue;
      
      if (!evaluatorScores.has(evaluatorId)) {
        evaluatorScores.set(evaluatorId, []);
      }
      evaluatorScores.get(evaluatorId)!.push(Number(evaluation.finalScore));
    }

    const biases: PerformanceBias[] = [];
    const overallAvg = this.calculateMean(
      evaluations.filter((e) => e.finalScore).map((e) => Number(e.finalScore))
    );
    const overallStd = this.calculateStd(
      evaluations.filter((e) => e.finalScore).map((e) => Number(e.finalScore))
    );

    for (const [evaluatorId, scores] of evaluatorScores) {
      const avg = this.calculateMean(scores);
      const std = this.calculateStd(scores);

      // 관대화 경향 (평균이 전체 평균보다 1 표준편차 이상 높음)
      if (avg > overallAvg + overallStd) {
        biases.push({
          evaluatorId,
          evaluatorName: evaluatorId, // 실제로는 조회 필요
          biasType: "LENIENT",
          severity: avg > overallAvg + 2 * overallStd ? "HIGH" : "MEDIUM",
          evidence: `평균 점수 ${avg.toFixed(1)}점 (전체 평균 ${overallAvg.toFixed(1)}점 대비 높음)`,
        });
      }

      // 엄격화 경향
      if (avg < overallAvg - overallStd) {
        biases.push({
          evaluatorId,
          evaluatorName: evaluatorId,
          biasType: "STRICT",
          severity: avg < overallAvg - 2 * overallStd ? "HIGH" : "MEDIUM",
          evidence: `평균 점수 ${avg.toFixed(1)}점 (전체 평균 ${overallAvg.toFixed(1)}점 대비 낮음)`,
        });
      }

      // 중심화 경향 (표준편차가 매우 작음)
      if (std < overallStd * 0.5 && scores.length >= 5) {
        biases.push({
          evaluatorId,
          evaluatorName: evaluatorId,
          biasType: "CENTRAL_TENDENCY",
          severity: std < overallStd * 0.25 ? "HIGH" : "MEDIUM",
          evidence: `점수 편차가 매우 작음 (표준편차 ${std.toFixed(1)})`,
        });
      }
    }

    return biases;
  }

  private static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private static calculateStd(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }
}

// ========================================
// 교육 추천 서비스
// ========================================

export class TrainingRecommendationService {
  /**
   * 직원별 교육 추천
   */
  static async recommendTraining(employeeId: string): Promise<TrainingRecommendation> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        position: true,
        organization: true,
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const recommendations: TrainingRecommendation["recommendations"] = [];

    // 1. 최근 평가에서 개선 필요 영역 분석
    const recentEvaluation = await prisma.evaluation.findFirst({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });

    if (recentEvaluation?.finalScore && Number(recentEvaluation.finalScore) < 70) {
      recommendations.push({
        courseName: "직무 역량 강화 과정",
        reason: "최근 평가 점수가 70점 미만으로 역량 개발 필요",
        priority: "HIGH",
        matchScore: 90,
      });
    }

    // 2. 직급별 필수 교육 추천
    // 리더십 교육 (팀장 이상)
    if (employee.position?.level && employee.position.level >= 4) {
      recommendations.push({
        courseName: "리더십 기본 과정",
        reason: "관리직 필수 교육",
        priority: "HIGH",
        matchScore: 95,
      });
    }

    // 3. 연차별 기본 교육
    const tenure = differenceInMonths(new Date(), employee.hireDate);
    if (tenure < 6) {
      recommendations.push({
        courseName: "신입 사원 온보딩 과정",
        reason: "신입 직원 필수 교육",
        priority: "HIGH",
        matchScore: 100,
      });
    }

    // 4. 일반 추천 교육
    if (tenure >= 12 && tenure < 36) {
      recommendations.push({
        courseName: "중견 사원 역량 강화 과정",
        reason: "경력 개발 권장 교육",
        priority: "MEDIUM",
        matchScore: 70,
      });
    }

    return {
      employeeId,
      recommendations: recommendations.sort((a, b) => b.matchScore - a.matchScore),
    };
  }
}

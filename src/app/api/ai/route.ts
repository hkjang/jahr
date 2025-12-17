// AI/HR 분석 API 라우트
// Phase 4: AI 기반 HR 기능

import { NextRequest, NextResponse } from "next/server";
import { TurnoverPredictionService, PerformanceAnalysisService, TrainingRecommendationService } from "@/lib/ai-analytics";
import { HRChatbotService, SummaryReportService } from "@/lib/hr-chatbot";
import { subMonths } from "date-fns";

// 이탈 예측 / 성과 분석 / 교육 추천
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const employeeId = searchParams.get("employeeId");
    const periodId = searchParams.get("periodId");
    const organizationId = searchParams.get("organizationId");

    switch (type) {
      // 인력 이탈 예측
      case "turnover":
        if (employeeId) {
          const prediction = await TurnoverPredictionService.predictTurnover(employeeId);
          return NextResponse.json({ success: true, data: prediction });
        } else {
          const predictions = await TurnoverPredictionService.analyzeAllEmployees();
          return NextResponse.json({ success: true, data: predictions });
        }

      // 성과 편향 분석
      case "bias":
        if (!periodId) {
          return NextResponse.json(
            { success: false, error: "periodId가 필요합니다" },
            { status: 400 }
          );
        }
        const biases = await PerformanceAnalysisService.detectBias(periodId);
        return NextResponse.json({ success: true, data: biases });

      // 교육 추천
      case "training":
        if (!employeeId) {
          return NextResponse.json(
            { success: false, error: "employeeId가 필요합니다" },
            { status: 400 }
          );
        }
        const recommendations = await TrainingRecommendationService.recommendTraining(employeeId);
        return NextResponse.json({ success: true, data: recommendations });

      // 부서별 요약 리포트
      case "summary":
        const startDate = subMonths(new Date(), 3);
        const endDate = new Date();
        
        if (organizationId) {
          const summary = await SummaryReportService.generateDepartmentSummary(
            organizationId,
            startDate,
            endDate
          );
          return NextResponse.json({ success: true, data: summary });
        } else {
          const companySummary = await SummaryReportService.generateCompanySummary(
            startDate,
            endDate
          );
          return NextResponse.json({ success: true, data: companySummary });
        }

      default:
        return NextResponse.json(
          { success: false, error: "유효하지 않은 type입니다 (turnover/bias/training/summary)" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI Analytics error:", error);
    return NextResponse.json(
      { success: false, error: "분석 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// HR 챗봇
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, employeeId } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "query가 필요합니다" },
        { status: 400 }
      );
    }

    const response = await HRChatbotService.processQuery(query, {
      userId,
      employeeId,
      history: [],
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { success: false, error: "챗봇 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

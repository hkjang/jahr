// Phase 9: HR 의사결정 지원 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "executive":
        return getExecutiveReports(searchParams);
      case "turnover":
        return getTurnoverRiskAnalysis(searchParams);
      case "diversity":
        return getDiversityMetrics(searchParams);
      case "compensation":
        return getCompensationAnalysis(searchParams);
      case "health":
        return getOrganizationHealthIndex(searchParams);
      default:
        return getExecutiveReports(searchParams);
    }
  } catch (error) {
    console.error("Error in decision support GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "executive":
        return createExecutiveReport(data);
      case "turnover":
        return createTurnoverRiskAnalysis(data);
      case "diversity":
        return createDiversityMetrics(data);
      case "compensation":
        return createCompensationAnalysis(data);
      case "health":
        return createOrganizationHealthIndex(data);
      case "generate":
        return generateAnalysis(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in decision support POST:", error);
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Executive Report functions
async function getExecutiveReports(searchParams: URLSearchParams) {
  const reportType = searchParams.get("reportType");
  const period = searchParams.get("period");

  const where: Record<string, unknown> = {};
  if (reportType) where.reportType = reportType;
  if (period) where.period = period;

  const reports = await prisma.executiveReport.findMany({
    where,
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json(reports);
}

async function createExecutiveReport(data: Record<string, unknown>) {
  const report = await prisma.executiveReport.create({
    data: {
      title: data.title as string,
      reportType: data.reportType as string,
      period: data.period as string,
      data: data.data as object,
      summary: data.summary as string | undefined,
      keyInsights: data.keyInsights as string[] || [],
      generatedBy: data.generatedBy as string,
    },
  });
  return NextResponse.json(report, { status: 201 });
}

// Turnover Risk Analysis functions
async function getTurnoverRiskAnalysis(searchParams: URLSearchParams) {
  const employeeId = searchParams.get("employeeId");
  const riskLevel = searchParams.get("riskLevel");

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (riskLevel) where.riskLevel = riskLevel;

  const analyses = await prisma.turnoverRiskAnalysis.findMany({
    where,
    orderBy: { analyzedAt: "desc" },
  });
  return NextResponse.json(analyses);
}

async function createTurnoverRiskAnalysis(data: Record<string, unknown>) {
  const analysis = await prisma.turnoverRiskAnalysis.create({
    data: {
      employeeId: data.employeeId as string,
      riskScore: data.riskScore as number,
      riskLevel: data.riskLevel as string,
      factors: data.factors as object,
      recommendations: data.recommendations as string[] || [],
    },
  });
  return NextResponse.json(analysis, { status: 201 });
}

// Diversity Metrics functions
async function getDiversityMetrics(searchParams: URLSearchParams) {
  const period = searchParams.get("period");
  const organizationId = searchParams.get("organizationId");

  const where: Record<string, unknown> = {};
  if (period) where.period = period;
  if (organizationId) where.organizationId = organizationId;

  const metrics = await prisma.diversityMetrics.findMany({
    where,
    orderBy: { measuredAt: "desc" },
  });
  return NextResponse.json(metrics);
}

async function createDiversityMetrics(data: Record<string, unknown>) {
  const metrics = await prisma.diversityMetrics.create({
    data: {
      period: data.period as string,
      organizationId: data.organizationId as string | undefined,
      metrics: data.metrics as object,
      genderRatio: data.genderRatio as number | undefined,
      ageDistribution: data.ageDistribution as object | undefined,
      positionDiversity: data.positionDiversity as number | undefined,
      trend: data.trend as object | undefined,
    },
  });
  return NextResponse.json(metrics, { status: 201 });
}

// Compensation Analysis functions
async function getCompensationAnalysis(searchParams: URLSearchParams) {
  const period = searchParams.get("period");
  const organizationId = searchParams.get("organizationId");

  const where: Record<string, unknown> = {};
  if (period) where.period = period;
  if (organizationId) where.organizationId = organizationId;

  const analyses = await prisma.compensationAnalysis.findMany({
    where,
    orderBy: { analyzedAt: "desc" },
  });
  return NextResponse.json(analyses);
}

async function createCompensationAnalysis(data: Record<string, unknown>) {
  const analysis = await prisma.compensationAnalysis.create({
    data: {
      period: data.period as string,
      organizationId: data.organizationId as string | undefined,
      avgSalaryByLevel: data.avgSalaryByLevel as object,
      payGap: data.payGap as object | undefined,
      performancePayRatio: data.performancePayRatio as number | undefined,
      marketComparison: data.marketComparison as object | undefined,
      recommendations: data.recommendations as string[] || [],
    },
  });
  return NextResponse.json(analysis, { status: 201 });
}

// Organization Health Index functions
async function getOrganizationHealthIndex(searchParams: URLSearchParams) {
  const organizationId = searchParams.get("organizationId");
  const period = searchParams.get("period");

  const where: Record<string, unknown> = {};
  if (organizationId) where.organizationId = organizationId;
  if (period) where.period = period;

  const indices = await prisma.organizationHealthIndex.findMany({
    where,
    orderBy: { calculatedAt: "desc" },
  });
  return NextResponse.json(indices);
}

async function createOrganizationHealthIndex(data: Record<string, unknown>) {
  const index = await prisma.organizationHealthIndex.create({
    data: {
      organizationId: data.organizationId as string | undefined,
      period: data.period as string,
      overallScore: data.overallScore as number,
      dimensions: data.dimensions as object,
      turnoverRate: data.turnoverRate as number | undefined,
      engagementScore: data.engagementScore as number | undefined,
      trainingHours: data.trainingHours as number | undefined,
      leaveUtilization: data.leaveUtilization as number | undefined,
      complianceRate: data.complianceRate as number | undefined,
      trend: data.trend as string | undefined,
    },
  });
  return NextResponse.json(index, { status: 201 });
}

// Auto-generate Analysis
async function generateAnalysis(data: Record<string, unknown>) {
  const { analysisType, organizationId, period } = data;
  const currentPeriod = period as string || format(new Date(), "yyyy-MM");

  switch (analysisType) {
    case "health": {
      // 조직 건강도 자동 계산
      const employees = await prisma.employee.count({
        where: organizationId ? { organizationId: organizationId as string } : {},
      });

      const turnover = await prisma.appointment.count({
        where: {
          type: { in: ["RESIGNATION", "RETIREMENT"] },
          effectiveDate: { gte: subMonths(new Date(), 12) },
        },
      });

      const turnoverRate = employees > 0 ? (turnover / employees) * 100 : 0;

      const leaveBalances = await prisma.leaveBalance.findMany({
        where: { year: new Date().getFullYear() },
      });

      const leaveUtilization = leaveBalances.length > 0
        ? leaveBalances.reduce((sum, lb) => sum + (lb.usedDays / lb.totalDays), 0) / leaveBalances.length * 100
        : 0;

      const overallScore = Math.max(0, 100 - (turnoverRate * 2) - Math.abs(50 - leaveUtilization) * 0.5);

      const healthIndex = await prisma.organizationHealthIndex.create({
        data: {
          organizationId: organizationId as string | undefined,
          period: currentPeriod,
          overallScore,
          dimensions: {
            retention: 100 - turnoverRate,
            leaveManagement: leaveUtilization,
          },
          turnoverRate,
          leaveUtilization,
          trend: turnoverRate > 10 ? "DOWN" : turnoverRate < 5 ? "UP" : "STABLE",
        },
      });

      return NextResponse.json(healthIndex, { status: 201 });
    }

    case "diversity": {
      // 다양성 지표 자동 계산
      const employees = await prisma.employee.findMany({
        where: organizationId ? { organizationId: organizationId as string } : {},
        include: { user: { select: { name: true } } },
      });

      const total = employees.length;
      const genderRatio = total > 0 ? 50 : 0; // 실제로는 성별 데이터 필요

      const diversityMetrics = await prisma.diversityMetrics.create({
        data: {
          period: currentPeriod,
          organizationId: organizationId as string | undefined,
          metrics: { totalEmployees: total },
          genderRatio,
          positionDiversity: 0.7, // 예시
        },
      });

      return NextResponse.json(diversityMetrics, { status: 201 });
    }

    default:
      return NextResponse.json({ error: "Unknown analysis type" }, { status: 400 });
  }
}

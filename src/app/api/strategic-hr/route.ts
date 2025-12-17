// Phase 1: 전략적 인력 계획 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ========================================
// Workforce Plan API
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const organizationId = searchParams.get("organizationId");

    switch (type) {
      case "plan":
        return getWorkforcePlans(year, organizationId);
      case "headcount":
        return getHeadcountLimits(organizationId);
      case "scenario":
        return getHeadcountScenarios();
      case "forecast":
        return getLaborCostForecasts(year);
      case "simulation":
        return getOrgSimulations();
      default:
        return getWorkforcePlans(year, organizationId);
    }
  } catch (error) {
    console.error("Error in strategic HR GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "plan":
        return createWorkforcePlan(data);
      case "headcount":
        return createHeadcountLimit(data);
      case "scenario":
        return createHeadcountScenario(data);
      case "forecast":
        return createLaborCostForecast(data);
      case "simulation":
        return createOrgSimulation(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in strategic HR POST:", error);
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "plan":
        return updateWorkforcePlan(id, data);
      case "headcount":
        return updateHeadcountLimit(id, data);
      case "scenario":
        return updateHeadcountScenario(id, data);
      case "forecast":
        return updateLaborCostForecast(id, data);
      case "simulation":
        return updateOrgSimulation(id, data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in strategic HR PUT:", error);
    return NextResponse.json({ error: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    switch (type) {
      case "plan":
        await prisma.workforcePlan.delete({ where: { id } });
        break;
      case "headcount":
        await prisma.headcountLimit.delete({ where: { id } });
        break;
      case "scenario":
        await prisma.headcountScenario.delete({ where: { id } });
        break;
      case "forecast":
        await prisma.laborCostForecast.delete({ where: { id } });
        break;
      case "simulation":
        await prisma.orgRestructureSimulation.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in strategic HR DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Workforce Plan functions
async function getWorkforcePlans(year: string | null, organizationId: string | null) {
  const where: Record<string, unknown> = {};
  if (year) where.year = parseInt(year);
  if (organizationId) where.organizationId = organizationId;

  const plans = await prisma.workforcePlan.findMany({
    where,
    include: { organization: { select: { name: true } } },
    orderBy: [{ year: "desc" }, { quarter: "asc" }],
  });
  return NextResponse.json(plans);
}

async function createWorkforcePlan(data: Record<string, unknown>) {
  const plan = await prisma.workforcePlan.create({
    data: {
      year: data.year as number,
      quarter: data.quarter as number | undefined,
      organizationId: data.organizationId as string,
      currentHeadcount: data.currentHeadcount as number,
      plannedHeadcount: data.plannedHeadcount as number,
      budgetAmount: data.budgetAmount as number,
      status: "DRAFT",
      notes: data.notes as string | undefined,
      createdBy: data.createdBy as string,
    },
  });
  return NextResponse.json(plan, { status: 201 });
}

async function updateWorkforcePlan(id: string, data: Record<string, unknown>) {
  const plan = await prisma.workforcePlan.update({
    where: { id },
    data: {
      plannedHeadcount: data.plannedHeadcount as number | undefined,
      budgetAmount: data.budgetAmount as number | undefined,
      status: data.status as "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | undefined,
      notes: data.notes as string | undefined,
    },
  });
  return NextResponse.json(plan);
}

// Headcount Limit functions
async function getHeadcountLimits(organizationId: string | null) {
  const where: Record<string, unknown> = {};
  if (organizationId) where.organizationId = organizationId;

  const limits = await prisma.headcountLimit.findMany({
    where,
    include: { organization: { select: { name: true } } },
    orderBy: { effectiveDate: "desc" },
  });
  return NextResponse.json(limits);
}

async function createHeadcountLimit(data: Record<string, unknown>) {
  const limit = await prisma.headcountLimit.create({
    data: {
      organizationId: data.organizationId as string,
      limitCount: data.limitCount as number,
      effectiveDate: new Date(data.effectiveDate as string),
      expiryDate: data.expiryDate ? new Date(data.expiryDate as string) : undefined,
    },
  });
  return NextResponse.json(limit, { status: 201 });
}

async function updateHeadcountLimit(id: string, data: Record<string, unknown>) {
  const limit = await prisma.headcountLimit.update({
    where: { id },
    data: {
      limitCount: data.limitCount as number | undefined,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate as string) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate as string) : undefined,
    },
  });
  return NextResponse.json(limit);
}

// Headcount Scenario functions
async function getHeadcountScenarios() {
  const scenarios = await prisma.headcountScenario.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(scenarios);
}

async function createHeadcountScenario(data: Record<string, unknown>) {
  const scenario = await prisma.headcountScenario.create({
    data: {
      name: data.name as string,
      description: data.description as string | undefined,
      baselineData: data.baselineData as object,
      changes: data.changes as object,
      costImpact: data.costImpact as number,
      status: "DRAFT",
      createdBy: data.createdBy as string,
    },
  });
  return NextResponse.json(scenario, { status: 201 });
}

async function updateHeadcountScenario(id: string, data: Record<string, unknown>) {
  const scenario = await prisma.headcountScenario.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      description: data.description as string | undefined,
      changes: data.changes as object | undefined,
      costImpact: data.costImpact as number | undefined,
      status: data.status as "DRAFT" | "ANALYZING" | "COMPLETED" | undefined,
    },
  });
  return NextResponse.json(scenario);
}

// Labor Cost Forecast functions
async function getLaborCostForecasts(year: string | null) {
  const where: Record<string, unknown> = {};
  if (year) where.yearMonth = { startsWith: year };

  const forecasts = await prisma.laborCostForecast.findMany({
    where,
    include: { organization: { select: { name: true } } },
    orderBy: { yearMonth: "desc" },
  });
  return NextResponse.json(forecasts);
}

async function createLaborCostForecast(data: Record<string, unknown>) {
  const forecast = await prisma.laborCostForecast.create({
    data: {
      yearMonth: data.yearMonth as string,
      organizationId: data.organizationId as string | undefined,
      baseSalary: data.baseSalary as number,
      bonus: data.bonus as number,
      benefits: data.benefits as number,
      totalCost: data.totalCost as number,
      isActual: data.isActual as boolean || false,
    },
  });
  return NextResponse.json(forecast, { status: 201 });
}

async function updateLaborCostForecast(id: string, data: Record<string, unknown>) {
  const forecast = await prisma.laborCostForecast.update({
    where: { id },
    data: {
      baseSalary: data.baseSalary as number | undefined,
      bonus: data.bonus as number | undefined,
      benefits: data.benefits as number | undefined,
      totalCost: data.totalCost as number | undefined,
      isActual: data.isActual as boolean | undefined,
    },
  });
  return NextResponse.json(forecast);
}

// Org Restructure Simulation functions
async function getOrgSimulations() {
  const simulations = await prisma.orgRestructureSimulation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(simulations);
}

async function createOrgSimulation(data: Record<string, unknown>) {
  const simulation = await prisma.orgRestructureSimulation.create({
    data: {
      name: data.name as string,
      description: data.description as string | undefined,
      currentStructure: data.currentStructure as object,
      proposedStructure: data.proposedStructure as object,
      impactAnalysis: data.impactAnalysis as object | undefined,
      status: "DRAFT",
      createdBy: data.createdBy as string,
    },
  });
  return NextResponse.json(simulation, { status: 201 });
}

async function updateOrgSimulation(id: string, data: Record<string, unknown>) {
  const simulation = await prisma.orgRestructureSimulation.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      description: data.description as string | undefined,
      proposedStructure: data.proposedStructure as object | undefined,
      impactAnalysis: data.impactAnalysis as object | undefined,
      status: data.status as "DRAFT" | "RUNNING" | "COMPLETED" | undefined,
    },
  });
  return NextResponse.json(simulation);
}

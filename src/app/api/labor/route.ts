// Phase 5: 노무/컴플라이언스 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "contract":
        return getLaborContracts(searchParams);
      case "rule":
        return getComplianceRules();
      case "alert":
        return getComplianceAlerts(searchParams);
      case "legal":
        return getLegalUpdates(searchParams);
      default:
        return getLaborContracts(searchParams);
    }
  } catch (error) {
    console.error("Error in labor GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "contract":
        return createLaborContract(data);
      case "rule":
        return createComplianceRule(data);
      case "alert":
        return createComplianceAlert(data);
      case "legal":
        return createLegalUpdate(data);
      case "resolve":
        return resolveAlert(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in labor POST:", error);
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
      case "contract":
        return updateLaborContract(id, data);
      case "rule":
        return updateComplianceRule(id, data);
      case "legal":
        return updateLegalUpdate(id, data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in labor PUT:", error);
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
      case "contract":
        await prisma.laborContract.delete({ where: { id } });
        break;
      case "rule":
        await prisma.complianceRule.delete({ where: { id } });
        break;
      case "alert":
        await prisma.complianceAlert.delete({ where: { id } });
        break;
      case "legal":
        await prisma.legalUpdate.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in labor DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Labor Contract functions
async function getLaborContracts(searchParams: URLSearchParams) {
  const employeeId = searchParams.get("employeeId");
  const status = searchParams.get("status");
  const expiring = searchParams.get("expiring");

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (expiring === "true") {
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    where.endDate = { lte: thirtyDaysLater, gte: new Date() };
    where.status = "ACTIVE";
  }

  const contracts = await prisma.laborContract.findMany({
    where,
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(contracts);
}

async function createLaborContract(data: Record<string, unknown>) {
  const contract = await prisma.laborContract.create({
    data: {
      employeeId: data.employeeId as string,
      contractType: data.contractType as string,
      startDate: new Date(data.startDate as string),
      endDate: data.endDate ? new Date(data.endDate as string) : undefined,
      probationEnd: data.probationEnd ? new Date(data.probationEnd as string) : undefined,
      workingHours: data.workingHours as number || 40,
      status: "ACTIVE",
      terms: data.terms as object | undefined,
      documentUrl: data.documentUrl as string | undefined,
    },
  });
  return NextResponse.json(contract, { status: 201 });
}

async function updateLaborContract(id: string, data: Record<string, unknown>) {
  const updateData: Record<string, unknown> = {};
  
  if (data.endDate) updateData.endDate = new Date(data.endDate as string);
  if (data.workingHours) updateData.workingHours = data.workingHours;
  if (data.status) updateData.status = data.status;
  if (data.terms) updateData.terms = data.terms;
  if (data.documentUrl) updateData.documentUrl = data.documentUrl;
  if (data.renewalCount !== undefined) updateData.renewalCount = data.renewalCount;

  const contract = await prisma.laborContract.update({
    where: { id },
    data: updateData as never,
  });
  return NextResponse.json(contract);
}

// Compliance Rule functions
async function getComplianceRules() {
  const rules = await prisma.complianceRule.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rules);
}

async function createComplianceRule(data: Record<string, unknown>) {
  const rule = await prisma.complianceRule.create({
    data: {
      name: data.name as string,
      description: data.description as string | undefined,
      ruleType: data.ruleType as "OVERTIME_LIMIT" | "CONTRACT_EXPIRY" | "COMPLIANCE_VIOLATION" | "LEGAL_UPDATE" | "RISK_DETECTED",
      threshold: data.threshold as object,
      isActive: true,
    },
  });
  return NextResponse.json(rule, { status: 201 });
}

async function updateComplianceRule(id: string, data: Record<string, unknown>) {
  const rule = await prisma.complianceRule.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      description: data.description as string | undefined,
      threshold: data.threshold as object | undefined,
      isActive: data.isActive as boolean | undefined,
    },
  });
  return NextResponse.json(rule);
}

// Compliance Alert functions
async function getComplianceAlerts(searchParams: URLSearchParams) {
  const severity = searchParams.get("severity");
  const resolved = searchParams.get("resolved");
  const employeeId = searchParams.get("employeeId");

  const where: Record<string, unknown> = {};
  if (severity) where.severity = severity;
  if (resolved !== null) where.isResolved = resolved === "true";
  if (employeeId) where.employeeId = employeeId;

  const alerts = await prisma.complianceAlert.findMany({
    where,
    include: { rule: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(alerts);
}

async function createComplianceAlert(data: Record<string, unknown>) {
  const alert = await prisma.complianceAlert.create({
    data: {
      ruleId: data.ruleId as string | undefined,
      type: data.type as "OVERTIME_LIMIT" | "CONTRACT_EXPIRY" | "COMPLIANCE_VIOLATION" | "LEGAL_UPDATE" | "RISK_DETECTED",
      severity: data.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      title: data.title as string,
      message: data.message as string,
      employeeId: data.employeeId as string | undefined,
      data: data.alertData as object | undefined,
      isResolved: false,
    },
  });
  return NextResponse.json(alert, { status: 201 });
}

async function resolveAlert(data: Record<string, unknown>) {
  const alert = await prisma.complianceAlert.update({
    where: { id: data.id as string },
    data: {
      isResolved: true,
      resolvedBy: data.resolvedBy as string,
      resolvedAt: new Date(),
      resolutionNotes: data.resolutionNotes as string | undefined,
    },
  });
  return NextResponse.json(alert);
}

// Legal Update functions
async function getLegalUpdates(searchParams: URLSearchParams) {
  const reviewed = searchParams.get("reviewed");
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {};
  if (reviewed !== null) where.isReviewed = reviewed === "true";
  if (category) where.category = category;

  const updates = await prisma.legalUpdate.findMany({
    where,
    orderBy: { effectiveDate: "desc" },
  });
  return NextResponse.json(updates);
}

async function createLegalUpdate(data: Record<string, unknown>) {
  const update = await prisma.legalUpdate.create({
    data: {
      title: data.title as string,
      description: data.description as string,
      effectiveDate: new Date(data.effectiveDate as string),
      category: data.category as string,
      sourceUrl: data.sourceUrl as string | undefined,
      isReviewed: false,
    },
  });
  return NextResponse.json(update, { status: 201 });
}

async function updateLegalUpdate(id: string, data: Record<string, unknown>) {
  const update = await prisma.legalUpdate.update({
    where: { id },
    data: {
      title: data.title as string | undefined,
      description: data.description as string | undefined,
      isReviewed: data.isReviewed as boolean | undefined,
      reviewedBy: data.reviewedBy as string | undefined,
      reviewedAt: data.isReviewed ? new Date() : undefined,
      impactNotes: data.impactNotes as string | undefined,
    },
  });
  return NextResponse.json(update);
}

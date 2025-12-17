// Phase 6: 데이터 거버넌스 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "snapshot":
        return getDataSnapshots(searchParams);
      case "issue":
        return getDataQualityIssues(searchParams);
      case "deletion":
        return getDeletionRequests(searchParams);
      case "masking":
        return getMaskingRules();
      default:
        return getDataQualityIssues(searchParams);
    }
  } catch (error) {
    console.error("Error in data governance GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "snapshot":
        return createDataSnapshot(data);
      case "issue":
        return createDataQualityIssue(data);
      case "deletion":
        return createDeletionRequest(data);
      case "masking":
        return createMaskingRule(data);
      case "resolve-issue":
        return resolveDataQualityIssue(data);
      case "process-deletion":
        return processDeletionRequest(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in data governance POST:", error);
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

    if (type === "masking") {
      return updateMaskingRule(id, data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in data governance PUT:", error);
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

    if (type === "masking") {
      await prisma.dataMaskingRule.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in data governance DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Data Snapshot functions
async function getDataSnapshots(searchParams: URLSearchParams) {
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  const changedBy = searchParams.get("changedBy");

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (changedBy) where.changedBy = changedBy;

  const snapshots = await prisma.dataSnapshot.findMany({
    where,
    orderBy: { changedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(snapshots);
}

async function createDataSnapshot(data: Record<string, unknown>) {
  const snapshot = await prisma.dataSnapshot.create({
    data: {
      entityType: data.entityType as string,
      entityId: data.entityId as string,
      operation: data.operation as string,
      beforeData: data.beforeData as object | undefined,
      afterData: data.afterData as object | undefined,
      changedBy: data.changedBy as string,
      reason: data.reason as string | undefined,
    },
  });
  return NextResponse.json(snapshot, { status: 201 });
}

// Data Quality Issue functions
async function getDataQualityIssues(searchParams: URLSearchParams) {
  const issueType = searchParams.get("issueType");
  const resolved = searchParams.get("resolved");
  const entityType = searchParams.get("entityType");

  const where: Record<string, unknown> = {};
  if (issueType) where.issueType = issueType;
  if (resolved !== null) where.isResolved = resolved === "true";
  if (entityType) where.entityType = entityType;

  const issues = await prisma.dataQualityIssue.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(issues);
}

async function createDataQualityIssue(data: Record<string, unknown>) {
  const issue = await prisma.dataQualityIssue.create({
    data: {
      issueType: data.issueType as "MISSING_DATA" | "INCONSISTENCY" | "DUPLICATE" | "INVALID_FORMAT" | "POLICY_VIOLATION",
      entityType: data.entityType as string,
      entityId: data.entityId as string,
      fieldName: data.fieldName as string,
      description: data.description as string,
      severity: data.severity as string,
      isResolved: false,
    },
  });
  return NextResponse.json(issue, { status: 201 });
}

async function resolveDataQualityIssue(data: Record<string, unknown>) {
  const issue = await prisma.dataQualityIssue.update({
    where: { id: data.id as string },
    data: {
      isResolved: true,
      resolvedBy: data.resolvedBy as string,
      resolvedAt: new Date(),
    },
  });
  return NextResponse.json(issue);
}

// Data Deletion Request functions
async function getDeletionRequests(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const targetUserId = searchParams.get("targetUserId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (targetUserId) where.targetUserId = targetUserId;

  const requests = await prisma.dataDeletionRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

async function createDeletionRequest(data: Record<string, unknown>) {
  const request = await prisma.dataDeletionRequest.create({
    data: {
      requesterId: data.requesterId as string,
      targetUserId: data.targetUserId as string,
      reason: data.reason as string,
      status: "PENDING",
    },
  });
  return NextResponse.json(request, { status: 201 });
}

async function processDeletionRequest(data: Record<string, unknown>) {
  const { id, approved, processedBy, deletedEntities } = data;

  const request = await prisma.dataDeletionRequest.update({
    where: { id: id as string },
    data: {
      status: approved ? "COMPLETED" : "REJECTED",
      processedBy: processedBy as string,
      processedAt: new Date(),
      deletedEntities: deletedEntities as object | undefined,
    },
  });
  return NextResponse.json(request);
}

// Data Masking Rule functions
async function getMaskingRules() {
  const rules = await prisma.dataMaskingRule.findMany({
    where: { isActive: true },
    orderBy: { entityType: "asc" },
  });
  return NextResponse.json(rules);
}

async function createMaskingRule(data: Record<string, unknown>) {
  const rule = await prisma.dataMaskingRule.create({
    data: {
      name: data.name as string,
      entityType: data.entityType as string,
      fieldName: data.fieldName as string,
      maskingType: data.maskingType as string,
      pattern: data.pattern as string | undefined,
      isActive: true,
    },
  });
  return NextResponse.json(rule, { status: 201 });
}

async function updateMaskingRule(id: string, data: Record<string, unknown>) {
  const rule = await prisma.dataMaskingRule.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      maskingType: data.maskingType as string | undefined,
      pattern: data.pattern as string | undefined,
      isActive: data.isActive as boolean | undefined,
    },
  });
  return NextResponse.json(rule);
}

// Phase 3: 정책/규정 관리 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "category":
        return getPolicyCategories();
      case "policy":
        return getPolicies(searchParams);
      case "version":
        return getPolicyVersions(searchParams.get("policyId"));
      case "acknowledgment":
        return getPolicyAcknowledgments(searchParams);
      default:
        return getPolicies(searchParams);
    }
  } catch (error) {
    console.error("Error in policy GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "category":
        return createPolicyCategory(data);
      case "policy":
        return createPolicy(data);
      case "version":
        return createPolicyVersion(data);
      case "acknowledgment":
        return createPolicyAcknowledgment(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in policy POST:", error);
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
      case "category":
        return updatePolicyCategory(id, data);
      case "policy":
        return updatePolicy(id, data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in policy PUT:", error);
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
      case "category":
        await prisma.policyCategory.delete({ where: { id } });
        break;
      case "policy":
        await prisma.policy.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in policy DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Policy Category functions
async function getPolicyCategories() {
  const categories = await prisma.policyCategory.findMany({
    include: { children: true, _count: { select: { policies: true } } },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

async function createPolicyCategory(data: Record<string, unknown>) {
  const category = await prisma.policyCategory.create({
    data: {
      name: data.name as string,
      description: data.description as string | undefined,
      parentId: data.parentId as string | undefined,
      sortOrder: data.sortOrder as number || 0,
    },
  });
  return NextResponse.json(category, { status: 201 });
}

async function updatePolicyCategory(id: string, data: Record<string, unknown>) {
  const category = await prisma.policyCategory.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      description: data.description as string | undefined,
      sortOrder: data.sortOrder as number | undefined,
    },
  });
  return NextResponse.json(category);
}

// Policy functions
async function getPolicies(searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (keyword) where.keywords = { has: keyword };

  const policies = await prisma.policy.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(policies);
}

async function createPolicy(data: Record<string, unknown>) {
  const policy = await prisma.policy.create({
    data: {
      code: data.code as string,
      title: data.title as string,
      categoryId: data.categoryId as string | undefined,
      currentVersion: 1,
      status: "DRAFT",
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate as string) : undefined,
      keywords: data.keywords as string[] || [],
      requiresAcknowledgment: data.requiresAcknowledgment as boolean || false,
      createdBy: data.createdBy as string,
    },
  });

  // Create initial version
  if (data.content) {
    await prisma.policyVersion.create({
      data: {
        policyId: policy.id,
        versionNumber: 1,
        content: data.content as string,
        summary: "초기 버전",
        effectiveDate: new Date(),
        createdBy: data.createdBy as string,
      },
    });
  }

  return NextResponse.json(policy, { status: 201 });
}

async function updatePolicy(id: string, data: Record<string, unknown>) {
  const policy = await prisma.policy.update({
    where: { id },
    data: {
      title: data.title as string | undefined,
      categoryId: data.categoryId as string | undefined,
      status: data.status as "DRAFT" | "UNDER_REVIEW" | "ACTIVE" | "DEPRECATED" | undefined,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate as string) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate as string) : undefined,
      keywords: data.keywords as string[] | undefined,
      requiresAcknowledgment: data.requiresAcknowledgment as boolean | undefined,
    },
  });
  return NextResponse.json(policy);
}

// Policy Version functions
async function getPolicyVersions(policyId: string | null) {
  if (!policyId) {
    return NextResponse.json({ error: "Policy ID is required" }, { status: 400 });
  }

  const versions = await prisma.policyVersion.findMany({
    where: { policyId },
    orderBy: { versionNumber: "desc" },
  });
  return NextResponse.json(versions);
}

async function createPolicyVersion(data: Record<string, unknown>) {
  // Get current version
  const policy = await prisma.policy.findUnique({
    where: { id: data.policyId as string },
  });

  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  const newVersionNumber = policy.currentVersion + 1;

  // Create new version
  const version = await prisma.policyVersion.create({
    data: {
      policyId: data.policyId as string,
      versionNumber: newVersionNumber,
      content: data.content as string,
      summary: data.summary as string | undefined,
      changeNotes: data.changeNotes as string | undefined,
      effectiveDate: new Date(data.effectiveDate as string),
      createdBy: data.createdBy as string,
    },
  });

  // Update policy current version
  await prisma.policy.update({
    where: { id: data.policyId as string },
    data: { currentVersion: newVersionNumber },
  });

  return NextResponse.json(version, { status: 201 });
}

// Policy Acknowledgment functions
async function getPolicyAcknowledgments(searchParams: URLSearchParams) {
  const policyId = searchParams.get("policyId");
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};
  if (policyId) where.policyId = policyId;
  if (userId) where.userId = userId;

  const acknowledgments = await prisma.policyAcknowledgment.findMany({
    where,
    include: { policy: { select: { title: true, code: true } } },
    orderBy: { acknowledgedAt: "desc" },
  });
  return NextResponse.json(acknowledgments);
}

async function createPolicyAcknowledgment(data: Record<string, unknown>) {
  const policy = await prisma.policy.findUnique({
    where: { id: data.policyId as string },
  });

  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  const acknowledgment = await prisma.policyAcknowledgment.create({
    data: {
      policyId: data.policyId as string,
      userId: data.userId as string,
      versionNumber: policy.currentVersion,
      ipAddress: data.ipAddress as string | undefined,
    },
  });
  return NextResponse.json(acknowledgment, { status: 201 });
}

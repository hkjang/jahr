// Phase 4: 증명서 발급 API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "template":
        return getTemplates();
      case "issuance":
        return getIssuances(searchParams);
      case "verify":
        return verifyCertificate(searchParams.get("code"));
      default:
        return getIssuances(searchParams);
    }
  } catch (error) {
    console.error("Error in certificate GET:", error);
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "template":
        return createTemplate(data);
      case "issuance":
        return createIssuance(data);
      case "approve":
        return approveIssuance(data);
      case "issue":
        return issueDocument(data);
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in certificate POST:", error);
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

    if (type === "template") {
      return updateTemplate(id, data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error in certificate PUT:", error);
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

    if (type === "template") {
      await prisma.certificateTemplate.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in certificate DELETE:", error);
    return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// Template functions
async function getTemplates() {
  const templates = await prisma.certificateTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

async function createTemplate(data: Record<string, unknown>) {
  const template = await prisma.certificateTemplate.create({
    data: {
      name: data.name as string,
      type: data.type as "EMPLOYMENT" | "CAREER" | "SALARY" | "POSITION" | "CUSTOM",
      content: data.content as string,
      variables: data.variables as object,
      isActive: true,
    },
  });
  return NextResponse.json(template, { status: 201 });
}

async function updateTemplate(id: string, data: Record<string, unknown>) {
  const template = await prisma.certificateTemplate.update({
    where: { id },
    data: {
      name: data.name as string | undefined,
      content: data.content as string | undefined,
      variables: data.variables as object | undefined,
      isActive: data.isActive as boolean | undefined,
    },
  });
  return NextResponse.json(template);
}

// Issuance functions
async function getIssuances(searchParams: URLSearchParams) {
  const employeeId = searchParams.get("employeeId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;

  const issuances = await prisma.certificateIssuance.findMany({
    where,
    include: { template: { select: { name: true, type: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(issuances);
}

async function createIssuance(data: Record<string, unknown>) {
  const verificationCode = randomBytes(8).toString("hex").toUpperCase();

  const issuance = await prisma.certificateIssuance.create({
    data: {
      templateId: data.templateId as string,
      employeeId: data.employeeId as string,
      requestedBy: data.requestedBy as string,
      purpose: data.purpose as string | undefined,
      status: "REQUESTED",
      verificationCode,
    },
  });
  return NextResponse.json(issuance, { status: 201 });
}

async function approveIssuance(data: Record<string, unknown>) {
  const { id, approvedBy, approved } = data;

  const issuance = await prisma.certificateIssuance.update({
    where: { id: id as string },
    data: {
      status: approved ? "APPROVED" : "REJECTED",
      approvedBy: approvedBy as string,
      approvedAt: new Date(),
    },
  });
  return NextResponse.json(issuance);
}

async function issueDocument(data: Record<string, unknown>) {
  const { id, documentUrl, signatureData, expiryDate } = data;

  const issuance = await prisma.certificateIssuance.update({
    where: { id: id as string },
    data: {
      status: "ISSUED",
      issuedAt: new Date(),
      documentUrl: documentUrl as string | undefined,
      signatureData: signatureData as object | undefined,
      expiryDate: expiryDate ? new Date(expiryDate as string) : undefined,
    },
  });
  return NextResponse.json(issuance);
}

async function verifyCertificate(code: string | null) {
  if (!code) {
    return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
  }

  const issuance = await prisma.certificateIssuance.findUnique({
    where: { verificationCode: code },
    include: { template: { select: { name: true, type: true } } },
  });

  if (!issuance) {
    return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });
  }

  const isExpired = issuance.expiryDate && issuance.expiryDate < new Date();

  return NextResponse.json({
    valid: issuance.status === "ISSUED" && !isExpired,
    issuedAt: issuance.issuedAt,
    type: issuance.template.type,
    expired: isExpired,
  });
}

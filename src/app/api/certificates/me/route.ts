import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET: 내 증명서 발급 목록
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    if (!user?.employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const certificates = await prisma.certificateIssuance.findMany({
      where: { employeeId: user.employee.id },
      include: { template: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

// POST: 증명서 발급 신청
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, purpose } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    if (!user?.employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    // 검증 코드 생성
    const verificationCode = `CERT-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const certificate = await prisma.certificateIssuance.create({
      data: {
        templateId,
        employeeId: user.employee.id,
        requestedBy: session.user.id,
        purpose,
        status: "REQUESTED",
        verificationCode,
      },
      include: { template: true },
    });

    return NextResponse.json({ success: true, data: certificate }, { status: 201 });
  } catch (error) {
    console.error("Error creating certificate request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create certificate request" },
      { status: 500 }
    );
  }
}

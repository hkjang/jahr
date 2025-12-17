import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        requester: {
          select: { name: true, employeeId: true, email: true },
        },
        lines: {
          include: {
            approver: {
              select: { name: true, employeeId: true },
            },
          },
          orderBy: { sequence: "asc" },
        },
        leaves: true,
        appointments: true,
      },
    });

    if (!approval) {
      return NextResponse.json(
        { success: false, error: "Approval not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    console.error("Error fetching approval:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch approval" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, comment } = body; // action: 'approve' | 'reject'

    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { lines: { orderBy: { sequence: "asc" } } },
    });

    if (!approval) {
      return NextResponse.json(
        { success: false, error: "Approval not found" },
        { status: 404 }
      );
    }

    // 현재 결재 단계 확인
    const currentLine = approval.lines.find(
      (line) => line.sequence === approval.currentStep && line.status === "PENDING"
    );

    if (!currentLine) {
      return NextResponse.json(
        { success: false, error: "No pending approval line" },
        { status: 400 }
      );
    }

    // 결재자 확인
    if (currentLine.approverId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You are not the current approver" },
        { status: 403 }
      );
    }

    // 결재 처리
    const lineStatus = action === "approve" ? "APPROVED" : "REJECTED";
    await prisma.approvalLine.update({
      where: { id: currentLine.id },
      data: {
        status: lineStatus,
        comment,
        actedAt: new Date(),
      },
    });

    // 전체 결재 상태 업데이트
    let newStatus = approval.status;
    let newStep = approval.currentStep;

    if (action === "reject") {
      newStatus = "REJECTED";
    } else if (approval.currentStep >= approval.lines.length) {
      // 마지막 결재자가 승인
      newStatus = "APPROVED";
    } else {
      // 다음 단계로
      newStep = approval.currentStep + 1;
    }

    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: {
        status: newStatus,
        currentStep: newStep,
        completedAt: newStatus !== "PENDING" ? new Date() : null,
      },
      include: {
        lines: {
          include: { approver: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedApproval });
  } catch (error) {
    console.error("Error updating approval:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update approval" },
      { status: 500 }
    );
  }
}

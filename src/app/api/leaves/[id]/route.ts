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

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: { select: { name: true, employeeId: true, email: true } },
            organization: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
        approval: {
          include: {
            lines: {
              orderBy: { sequence: "asc" },
            },
          },
        },
      },
    });

    if (!leave) {
      return NextResponse.json(
        { success: false, error: "Leave not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: leave });
  } catch (error) {
    console.error("Error fetching leave:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave" },
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
    const { status, approverComment } = body;

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) {
      return NextResponse.json(
        { success: false, error: "Leave not found" },
        { status: 404 }
      );
    }

    // 승인/반려 처리
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status,
      },
    });

    // 승인된 경우 연차 차감
    if (status === "APPROVED") {
      const currentYear = new Date().getFullYear();
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: leave.employeeId,
          year: currentYear,
          leaveType: leave.type,
        },
        data: {
          usedDays: { increment: leave.days },
        },
      });
    }

    return NextResponse.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error("Error updating leave:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update leave" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return NextResponse.json(
        { success: false, error: "Leave not found" },
        { status: 404 }
      );
    }

    // 대기 상태인 경우에만 취소 가능
    if (leave.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Only pending leaves can be cancelled" },
        { status: 400 }
      );
    }

    await prisma.leave.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true, message: "Leave cancelled" });
  } catch (error) {
    console.error("Error cancelling leave:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel leave" },
      { status: 500 }
    );
  }
}

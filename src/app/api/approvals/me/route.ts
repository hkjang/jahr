import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    // 내가 요청한 결재
    const requested = await prisma.approval.findMany({
      where: { requesterId: user.employee.id },
      include: {
        lines: {
          include: { approver: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // 내가 결재할 문서
    const toApprove = await prisma.approval.findMany({
      where: {
        status: "PENDING",
        lines: {
          some: {
            approverId: session.user.id,
            status: "PENDING",
          },
        },
      },
      include: {
        requester: {
          select: { name: true },
        },
        lines: {
          include: { approver: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 내 차례인 결재만 필터링
    const pendingForMe = toApprove.filter((approval) => {
      const currentLine = approval.lines.find(
        (line) => line.sequence === approval.currentStep
      );
      return currentLine?.approverId === session.user.id && currentLine?.status === "PENDING";
    });

    return NextResponse.json({
      success: true,
      data: {
        requested,
        toApprove: pendingForMe,
      },
    });
  } catch (error) {
    console.error("Error fetching my approvals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}

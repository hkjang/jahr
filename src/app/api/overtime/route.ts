import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: 내 초과근무 목록
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 초과근무 결재 문서 조회
    const overtimes = await prisma.approval.findMany({
      where: {
        type: "OVERTIME",
        requesterId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: overtimes });
  } catch (error) {
    console.error("Error fetching overtimes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch overtimes" },
      { status: 500 }
    );
  }
}

// POST: 초과근무 신청
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, startTime, endTime, reason } = body;

    // 시간 계산
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // 문서번호 생성
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.approval.count({
      where: {
        type: "OVERTIME",
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    const docNumber = `${datePrefix}-OVT-${String(count + 1).padStart(4, "0")}`;

    const approval = await prisma.approval.create({
      data: {
        docNumber,
        type: "OVERTIME",
        title: `초과근무 신청 (${date})`,
        content: {
          date,
          startTime,
          endTime,
          hours,
          reason,
        },
        requesterId: session.user.id,
        status: "PENDING",
        currentStep: 1,
        lines: {
          create: [
            {
              sequence: 1,
              approverId: session.user.id, // 실제로는 상사 ID
              status: "PENDING",
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, data: approval }, { status: 201 });
  } catch (error) {
    console.error("Error creating overtime:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create overtime" },
      { status: 500 }
    );
  }
}

// DELETE: 초과근무 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 }
      );
    }

    const approval = await prisma.approval.findFirst({
      where: {
        id,
        type: "OVERTIME",
        requesterId: session.user.id,
        status: "PENDING",
      },
    });

    if (!approval) {
      return NextResponse.json(
        { success: false, error: "Overtime request not found or cannot be cancelled" },
        { status: 404 }
      );
    }

    await prisma.approval.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling overtime:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel overtime" },
      { status: 500 }
    );
  }
}

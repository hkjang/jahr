import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: 근태 정정 신청
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, originalCheckIn, originalCheckOut, correctedCheckIn, correctedCheckOut, reason } = body;

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

    // 문서번호 생성
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.approval.count({
      where: {
        type: "OTHER",
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    const docNumber = `${datePrefix}-ATT-${String(count + 1).padStart(4, "0")}`;

    const approval = await prisma.approval.create({
      data: {
        docNumber,
        type: "OTHER",
        title: `근태 정정 신청 (${date})`,
        content: {
          date,
          originalCheckIn,
          originalCheckOut,
          correctedCheckIn,
          correctedCheckOut,
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
    console.error("Error creating attendance correction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create attendance correction" },
      { status: 500 }
    );
  }
}

// GET: 내 근태 정정 신청 목록
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const corrections = await prisma.approval.findMany({
      where: {
        type: "OTHER",
        requesterId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: corrections });
  } catch (error) {
    console.error("Error fetching attendance corrections:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance corrections" },
      { status: 500 }
    );
  }
}

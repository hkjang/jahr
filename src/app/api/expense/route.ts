import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: 내 경비 목록
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

    // Expense 모델이 없으면 빈 배열 반환
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST: 경비 청구
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, amount, date, description } = body;

    // 결재 문서로 생성
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
        type: "EXPENSE",
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    const docNumber = `${datePrefix}-EXP-${String(count + 1).padStart(4, "0")}`;

    const approval = await prisma.approval.create({
      data: {
        docNumber,
        type: "EXPENSE",
        title: `경비 청구 - ${description}`,
        content: {
          category,
          amount,
          date,
          description,
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
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

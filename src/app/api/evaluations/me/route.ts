import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 현재 사용자의 employee 정보 조회
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

    const evaluations = await prisma.evaluation.findMany({
      where: { employeeId: user.employee.id },
      include: {
        period: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: evaluations });
  } catch (error) {
    console.error("Error fetching my evaluations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch evaluations" },
      { status: 500 }
    );
  }
}

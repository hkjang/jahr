import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get("yearMonth") || undefined;

    // 현재 사용자의 employeeId 가져오기
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeId = (session.user as any)?.employee?.id;
    
    if (!employeeId) {
      // 세션에 employee 정보가 없으면 DB에서 조회
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

      const salary = await prisma.salary.findFirst({
        where: {
          employeeId: user.employee.id,
          ...(yearMonth && { yearMonth }),
        },
        orderBy: { yearMonth: "desc" },
      });

      return NextResponse.json({ success: true, data: salary });
    }

    const salary = await prisma.salary.findFirst({
      where: {
        employeeId,
        ...(yearMonth && { yearMonth }),
      },
      orderBy: { yearMonth: "desc" },
    });

    return NextResponse.json({ success: true, data: salary });
  } catch (error) {
    console.error("Error fetching my salary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch salary" },
      { status: 500 }
    );
  }
}

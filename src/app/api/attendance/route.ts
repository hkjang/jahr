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
    const employeeId = searchParams.get("employeeId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "31");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: { name: true, employeeId: true },
              },
              organization: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: attendances,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendances" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { employeeId } = body;
    const { date, checkIn, checkOut, workType, note } = body;

    // employeeId가 없으면 세션에서 조회
    if (!employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { user: { id: session.user.id } },
        select: { id: true },
      });
      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found for current user" },
          { status: 404 }
        );
      }
      employeeId = employee.id;
    }

    // 해당 날짜의 기존 기록이 있는지 확인
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: new Date(date),
      },
    });

    let attendance;
    if (existing) {
      // 기존 기록 업데이트
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: checkIn ? new Date(checkIn) : existing.checkIn,
          checkOut: checkOut ? new Date(checkOut) : existing.checkOut,
          workType: workType || existing.workType,
          note: note !== undefined ? note : existing.note,
        },
      });
    } else {
      // 새 기록 생성
      attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(date),
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          workType: workType || "OFFICE",
          note,
        },
      });
    }

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create attendance" },
      { status: 500 }
    );
  }
}

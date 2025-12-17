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
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (status) {
      where.status = status;
    }

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: { name: true, employeeId: true },
              },
              organization: { select: { name: true } },
            },
          },
          approval: {
            select: { status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.leave.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: leaves,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaves" },
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
    const { employeeId, type, startDate, endDate, days, reason } = body;

    // 휴가 신청과 결재 동시 생성
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: "PENDING",
      },
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error) {
    console.error("Error creating leave:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create leave" },
      { status: 500 }
    );
  }
}

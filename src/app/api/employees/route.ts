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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const organizationId = searchParams.get("organizationId") || undefined;
    const status = searchParams.get("status") || undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { employeeId: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (status) {
      where.user = { ...where.user, status };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              name: true,
              phoneNumber: true,
              profileImage: true,
              status: true,
            },
          },
          organization: {
            select: { id: true, code: true, name: true },
          },
          position: {
            select: { id: true, code: true, name: true },
          },
          jobTitle: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: employees,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
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

    // 권한 체크
    const hasPermission = session.user.permissions?.includes("employee:write:all");
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { user: userData, ...employeeData } = body;

    // 트랜잭션으로 사용자와 직원 정보 함께 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          status: "ACTIVE",
        },
      });

      const employee = await tx.employee.create({
        data: {
          ...employeeData,
          userId: user.id,
          hireDate: new Date(employeeData.hireDate),
        },
        include: {
          user: true,
          organization: true,
          position: true,
        },
      });

      return employee;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
